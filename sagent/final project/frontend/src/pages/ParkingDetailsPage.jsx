import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createParkingReview, fetchParkingDetails, fetchParkingReviews } from '../services/parkingService';
import { currency, formatNumber } from '../utils/formatters';

export default function ParkingDetailsPage() {
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    Promise.all([fetchParkingDetails(id), fetchParkingReviews(id)]).then(([spaceData, reviewData]) => {
      setSpace(spaceData);
      setReviews(reviewData);
    });
  }, [id]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    await createParkingReview(id, {
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment
    });
    const [spaceData, reviewData] = await Promise.all([fetchParkingDetails(id), fetchParkingReviews(id)]);
    setSpace(spaceData);
    setReviews(reviewData);
    setReviewForm({ rating: 5, comment: '' });
  };

  if (!space) {
    return <div className="container py-5">Loading...</div>;
  }

  return (
    <div className="container py-5">
      <div className="card hero-card p-4">
        <div className="d-flex justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="fw-bold">{space.name}</h2>
            <p className="text-muted mb-1">{space.address}</p>
            <p>{space.description}</p>
          </div>
          <div className="text-end">
            <div className="fs-4 fw-semibold">{currency(space.pricePerHour)} / hour</div>
            <div>Available slots: {formatNumber(space.availableSlots)}</div>
            <div>Rating: {Number(space.averageRating).toFixed(1)}</div>
          </div>
        </div>
        <div className="mt-4">
          <h5>Reviews</h5>
          <ul className="list-group">
            {reviews.map((review) => (
              <li className="list-group-item" key={review.id}>
                <div className="fw-semibold">{review.buyerName} - {review.rating}/5</div>
                <div>{review.comment}</div>
              </li>
            ))}
          </ul>
        </div>
        <form className="mt-4" onSubmit={handleReviewSubmit}>
          <h5>Add Review</h5>
          <div className="row g-3">
            <div className="col-md-2">
              <select className="form-select" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>
            <div className="col-md-8">
              <input className="form-control" placeholder="Share your experience" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-primary w-100">Submit</button>
            </div>
          </div>
        </form>
        <div className="mt-4">
          <Link className="btn btn-primary" to={`/booking/${space.id}`}>Proceed to Book</Link>
        </div>
      </div>
    </div>
  );
}
