import { createPortal } from 'react-dom';

export default function Backdrop({ onClick, children }) {
  return createPortal(
    <div
      onClick={onClick}
      className="fixed inset-0 bg-[#1a0e06]/70 backdrop-blur-[3px] flex items-center justify-center z-[100]"
    >
      {children}
    </div>,
    document.body
  );
}
