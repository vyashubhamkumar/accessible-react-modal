import React from "react";

function Modal({ open, onClose, children }) {
  if (open) {
    return (
      <div className={"c-modal-root"}>
        <div onClick={(e) => onClose()} className="c-modal-overlay"></div>
        <div className="c-modal-paper">
          <button onClick={(e) => onClose()} className="c-modal-close">
            &times;
          </button>
          {children}
        </div>
      </div>
    );
  }
  return null;
}

export default Modal;
