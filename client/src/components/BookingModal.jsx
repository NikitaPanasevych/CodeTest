import { useState } from 'react';
import { postBooking } from '../api';
import { CELL_TYPES } from '../constants/cellTypes';
import Backdrop from './Backdrop';
import Dialog from './Dialog';

export default function BookingModal({ cabana, onClose, onBooked }) {
  const [room, setRoom] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (cabana.type === CELL_TYPES.CABANA && !cabana.available) {
    return (
      <Backdrop onClick={onClose}>
        <Dialog onClick={e => e.stopPropagation()}>
          <h2 className="text-[#3d1f0d] mb-1">Cabana Unavailable</h2>
          <p className="text-[#8b6914]/80 text-sm mb-5">This cabana has already been booked.</p>
          <button onClick={onClose} className={primaryBtn}>Close</button>
        </Dialog>
      </Backdrop>
    );
  }

  if (success) {
    return (
      <Backdrop onClick={onClose}>
        <Dialog onClick={e => e.stopPropagation()}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#0d7377] font-medium mb-1">Confirmed</p>
          <h2 className="text-[#0d7377] mb-1">Booking Confirmed!</h2>
          <p className="text-[#5c3410]/70 text-sm mb-5">Your cabana has been reserved. Enjoy your stay!</p>
          <button onClick={onClose} className={primaryBtn}>Back to Map</button>
        </Dialog>
      </Backdrop>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await postBooking(cabana.cabanaId, room, guestName);
      if (result.success) {
        setSuccess(true);
        onBooked();
      } else {
        setError(result.error || 'Booking failed');
      }
    } catch {
      setError('Network error, please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Backdrop onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#8b6914] font-medium mb-1">Reserve</p>
        <h2 className="text-[#3d1f0d] mb-5">Book Cabana</h2>
        <form onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 mb-4 text-xs tracking-widest uppercase font-medium text-[#5c3410]">
            Room Number
            <input
              className="px-3 py-2.5 bg-white border border-[#d4a843]/40 rounded-[2px] text-sm font-[var(--font-body)] text-[#3d1f0d] outline-none focus:border-[#c8921a] focus:ring-1 focus:ring-[#c8921a]/30 transition-colors placeholder:text-[#c8a96e]"
              value={room}
              onChange={e => setRoom(e.target.value)}
              placeholder="e.g. 101"
              required
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1.5 mb-4 text-xs tracking-widest uppercase font-medium text-[#5c3410]">
            Guest Name
            <input
              className="px-3 py-2.5 bg-white border border-[#d4a843]/40 rounded-[2px] text-sm font-[var(--font-body)] text-[#3d1f0d] outline-none focus:border-[#c8921a] focus:ring-1 focus:ring-[#c8921a]/30 transition-colors placeholder:text-[#c8a96e]"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="e.g. Alice Smith"
              required
            />
          </label>
          {error && (
            <p className="text-red-700 bg-red-50 border border-red-200 rounded-[2px] px-3 py-2 text-xs mb-3">
              {error}
            </p>
          )}
          <div className="flex gap-2 mt-5">
            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
            <button type="button" onClick={onClose} className={ghostBtn}>
              Cancel
            </button>
          </div>
        </form>
      </Dialog>
    </Backdrop>
  );
}

const primaryBtn =
  'px-5 py-2.5 bg-[#c8921a] hover:bg-[#a87515] text-white border-0 rounded-[2px] cursor-pointer text-xs tracking-widest uppercase font-medium transition-colors duration-150 disabled:opacity-60';

const ghostBtn =
  'px-5 py-2.5 bg-transparent hover:bg-[#8b6914]/10 text-[#8b6914] border border-[#d4a843]/50 rounded-[2px] cursor-pointer text-xs tracking-widest uppercase font-medium transition-colors duration-150';
