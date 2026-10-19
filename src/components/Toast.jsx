import React from 'react';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';

export default function Toast({ show, message, isError = false }) {
  if (!show) return null;

  return (
    <div
      className={`toast-msg ${show ? 'show' : ''} ${isError ? 'error' : ''}`}
      id="toastMsg"
      role="alert"
    >
      {isError ? (
        <WarningCircle size={20} weight="fill" color="#ef4444" />
      ) : (
        <CheckCircle size={20} weight="fill" color="#22c55e" />
      )}
      <div
        className="toast-text"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    </div>
  );
}
