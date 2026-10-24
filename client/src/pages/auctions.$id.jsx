import { apiUrl } from "../config/api";
import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

const AuctionDetailPage = () => {
  const { id } = Route.useParams();

  const [listing, setListing] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  console.log('listing', listing);
  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const [listingRes, bidsRes] = await Promise.all([
          fetch(apiUrl(`/auctions/${id}`), {
            credentials: "include",
          }),
          fetch(apiUrl(`/auctions/${id}/bids`), {
            credentials: "include",
          }),
        ]);

        if (!listingRes.ok) {
          throw new Error("failed to fetch auction detail");
        }

        const listingData = await listingRes.json();

        let bidsData = { data: [] };
        if (bidsRes.ok) {
          bidsData = await bidsRes.json();
        }

        setListing(listingData.data);
        setBids(bidsData.data || []);
      } catch (err) {
        console.error("fetch auction detail error:", err);
        setError("Failed to load auction detail");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionDetail();
  }, [id]);

  if (loading) {
    return <div className="text-center pt-20">Loading auction detail...</div>;
  }

  if (error) {
    return <div className="text-center pt-20 text-red-500">{error}</div>;
  }

  if (!listing) {
    return <div className="text-center pt-20">Auction not found.</div>;
  } 
  console.log('bids:', bids);
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={listing.item_image_url}
            alt={listing.item_name}
            className="w-full max-w-[400px] object-cover rounded-lg"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{listing.item_name}</h1>

          <p>{listing.item_description || "No description"}</p>

          <div>
            <span className="font-semibold">Current Price: </span>
            {listing.current_price}
          </div>

          {/* 加上 category */}
          <div>
            <span className="font-semibold">Category: </span>
            {listing.category}
          </div>

          <div>
            <span className="font-semibold">Starting Price: </span>
            {listing.starting_price}
          </div>

          <div>
            <span className="font-semibold">Min Increment: </span>
            {listing.min_increment}
          </div>

          <div>
            <span className="font-semibold">Status: </span>
            {listing.status}
          </div>

          <div>
            <span className="font-semibold">End Time: </span>
            {new Date(listing.end_time).toLocaleString()}
          </div>

          <button className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-md">
            Place Bid
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Bid History</h2>

        {bids.length === 0 ? (
          <p>No bids yet.</p>
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="border border-gray-300 rounded-md p-4"
              >
                <div>Bid Amount: {bid.bid_amount}</div>
                <div>Bidder ID: {bid.bidder_id}</div>
                <div>{new Date(bid.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetailPage;

export const Route = createFileRoute("/auctions/$id")({
  component: AuctionDetailPage,
});