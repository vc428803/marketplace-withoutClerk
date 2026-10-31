package repository

import (
	"context"
	"errors"
	"time"

	"todo_api/internal/models"
	"todo_api/internal/utils"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrAuctionItemNotOwned    = errors.New("auction item not owned")
	ErrAuctionItemUnavailable = errors.New("auction item unavailable")
)

// 建立一筆新的拍賣商品
func CreateAuctionListing(
	pool *pgxpool.Pool,
	sellerID string,
	req models.CreateAuctionListingRequest,
) (*models.AuctionListing, error) {
	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	tx, err := pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// 1. 鎖定背包中的實際物品
	var ownerID string
	var itemName string
	var imageURL string
	var description string
	var category string
	var isTradeable bool
	var status string

	err = tx.QueryRow(ctx, `
        SELECT
            i.owner_id,
            d.name,
            COALESCE(d.image_url, ''),
            COALESCE(d.description, ''),
            d.category,
            d.is_tradeable,
            i.status
        FROM inventory_items i
        JOIN item_definitions d
            ON d.id = i.item_definition_id
        WHERE i.id = $1
        FOR UPDATE OF i
    `, req.InventoryItemID).Scan(
		&ownerID,
		&itemName,
		&imageURL,
		&description,
		&category,
		&isTradeable,
		&status,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrAuctionItemNotOwned
	}
	if err != nil {
		return nil, err
	}

	// 2. 驗證物品所有權與狀態
	if ownerID != sellerID {
		return nil, ErrAuctionItemNotOwned
	}

	if !isTradeable || status != "AVAILABLE" {
		return nil, ErrAuctionItemUnavailable
	}

	// 3. 從資料庫資料建立競拍紀錄
	var listing models.AuctionListing

	err = tx.QueryRow(ctx, `
        INSERT INTO auction_listings (
            seller_id,
            inventory_item_id,
            item_name,
            item_image_url,
            category,
            item_description,
            starting_price,
            current_price,
            min_increment,
            status,
            start_time,
            end_time
        )
        VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $7, $8, 'active', NOW(), $9
        )
        RETURNING
            id,
            seller_id,
            item_name,
            item_image_url,
            category,
            COALESCE(item_description, ''),
            starting_price,
            current_price,
            min_increment,
            highest_bidder_id,
            status,
            start_time,
            end_time,
            created_at,
            updated_at
    `,
		sellerID,
		req.InventoryItemID,
		itemName,
		imageURL,
		category,
		description,
		req.StartingPrice,
		req.MinIncrement,
		req.EndTime,
	).Scan(
		&listing.ID,
		&listing.SellerID,
		&listing.ItemName,
		&listing.ItemImageURL,
		&listing.Category,
		&listing.ItemDescription,
		&listing.StartingPrice,
		&listing.CurrentPrice,
		&listing.MinIncrement,
		&listing.HighestBidderID,
		&listing.Status,
		&listing.StartTime,
		&listing.EndTime,
		&listing.CreatedAt,
		&listing.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	// 4. 將物品標記為已上架
	commandTag, err := tx.Exec(ctx, `
        UPDATE inventory_items
        SET status = 'LISTED',
            updated_at = NOW()
        WHERE id = $1
          AND owner_id = $2
          AND status = 'AVAILABLE'
    `, req.InventoryItemID, sellerID)

	if err != nil {
		return nil, err
	}

	if commandTag.RowsAffected() != 1 {
		return nil, ErrAuctionItemUnavailable
	}

	// 5. 全部成功才提交
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &listing, nil
}

// GetAuctionListings 取得所有拍賣商品
// 目前先只抓 active，並依建立時間新到舊排序
func GetAuctionListings(pool *pgxpool.Pool) ([]models.AuctionListing, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	utils.PerformOperation(ctx)

	query := `
		SELECT
			a.id,
			a.seller_id,
			a.item_name,
			COALESCE(d.image_url, '') AS item_image_url,
			a.item_description,
			a.starting_price,
			a.current_price,
			a.min_increment,
			a.highest_bidder_id,
			a.status,
			a.start_time,
			a.end_time,
			a.created_at,
			a.updated_at
		FROM auction_listings a
		LEFT JOIN inventory_items i
			ON a.inventory_item_id = i.id
		LEFT JOIN item_definitions d
			ON i.item_definition_id = d.id
		WHERE a.status = 'active'
		ORDER BY a.created_at DESC
		`

	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var listings []models.AuctionListing

	for rows.Next() {
		var listing models.AuctionListing

		err := rows.Scan(
			&listing.ID,
			&listing.SellerID,
			&listing.ItemName,
			&listing.ItemImageURL,
			&listing.ItemDescription,
			&listing.StartingPrice,
			&listing.CurrentPrice,
			&listing.MinIncrement,
			&listing.HighestBidderID,
			&listing.Status,
			&listing.StartTime,
			&listing.EndTime,
			&listing.CreatedAt,
			&listing.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		listings = append(listings, listing)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return listings, nil
}

// 根據 id 取得單一拍賣商品
func GetAuctionListingByID(pool *pgxpool.Pool, listingID string) (*models.AuctionListing, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	utils.PerformOperation(ctx)

	query := `
		SELECT
			id,
			seller_id,
			item_name,
			item_image_url,
			category,
			item_description,
			starting_price,
			current_price,
			min_increment,
			highest_bidder_id,
			status,
			start_time,
			end_time,
			created_at,
			updated_at
		FROM auction_listings
		WHERE id = $1
	`

	var listing models.AuctionListing

	err := pool.QueryRow(ctx, query, listingID).Scan(
		&listing.ID,
		&listing.SellerID,
		&listing.ItemName,
		&listing.ItemImageURL,
		&listing.Category,
		&listing.ItemDescription,
		&listing.StartingPrice,
		&listing.CurrentPrice,
		&listing.MinIncrement,
		&listing.HighestBidderID,
		&listing.Status,
		&listing.StartTime,
		&listing.EndTime,
		&listing.CreatedAt,
		&listing.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &listing, nil
}

// GetAuctionBidsByListingID 取得某一筆拍賣商品的所有出價紀錄
func GetAuctionBidsByListingID(pool *pgxpool.Pool, listingID string) ([]models.AuctionBid, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	utils.PerformOperation(ctx)

	query := `
		SELECT
			id,
			listing_id,
			bidder_id,
			bid_amount,
			created_at
		FROM auction_bids
		WHERE listing_id = $1
		ORDER BY created_at DESC
	`

	rows, err := pool.Query(ctx, query, listingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bids []models.AuctionBid

	for rows.Next() {
		var bid models.AuctionBid

		err := rows.Scan(
			&bid.ID,
			&bid.ListingID,
			&bid.BidderID,
			&bid.BidAmount,
			&bid.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		bids = append(bids, bid)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return bids, nil
}

// PlaceBid 建立一筆出價，並同步更新 auction_listings 的 current_price / highest_bidder_id
// 這裡一定要用 transaction，避免多人同時出價造成資料不一致
func PlaceBid(pool *pgxpool.Pool, listingID string, bidderID string, bidAmount int64) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	utils.PerformOperation(ctx)

	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 先把該 listing 鎖住，避免同時多人更新
	query := `
		SELECT
			seller_id,
			current_price,
			min_increment,
			status,
			end_time
		FROM auction_listings
		WHERE id = $1
		FOR UPDATE
	`

	var sellerID string
	var currentPrice int64
	var minIncrement int64
	var status string
	var endTime time.Time

	err = tx.QueryRow(ctx, query, listingID).Scan(
		&sellerID,
		&currentPrice,
		&minIncrement,
		&status,
		&endTime,
	)
	if err != nil {
		return err
	}

	// 不允許自己競標自己的商品
	if sellerID == bidderID {
		return errors.New("seller cannot bid on own listing")
	}

	// 只有 active 狀態才可以出價
	if status != "active" {
		return errors.New("listing is not active")
	}

	// 超過結束時間就不能再出價
	if time.Now().After(endTime) {
		return errors.New("auction has already ended")
	}

	// 出價必須大於等於目前價格 + 最小加價幅度
	minValidBid := currentPrice + minIncrement
	if bidAmount < minValidBid {
		return errors.New("bid amount is too low")
	}

	// 新增出價紀錄
	insertBidQuery := `
		INSERT INTO auction_bids (
			listing_id,
			bidder_id,
			bid_amount
		)
		VALUES ($1, $2, $3)
	`

	_, err = tx.Exec(ctx, insertBidQuery, listingID, bidderID, bidAmount)
	if err != nil {
		return err
	}

	// 更新拍賣商品目前價格與最高出價者
	updateListingQuery := `
		UPDATE auction_listings
		SET
			current_price = $1,
			highest_bidder_id = $2,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`

	_, err = tx.Exec(ctx, updateListingQuery, bidAmount, bidderID, listingID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
