import toast from 'react-hot-toast';
import { useState } from 'react';

const displayError = (message: string, error: Error) => {
  const ErrorContent = ({ toastId }: { toastId: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
        <button
          onClick={() => toast.dismiss(toastId)}
          style={{
            position: 'absolute',
            right: '-8px',
            top: '-8px',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 200, 200, 0.8)',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ✕
        </button>
        <p style={{ fontSize: '16px', fontWeight: 500 }}>{message}</p>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ 
            background: 'none',
            border: 'none',
            color: 'rgba(255, 200, 200, 0.8)',
            fontSize: '12px',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left'
          }}
        >
          {isExpanded ? 'Cacher les infos ▼' : 'Plus d\'infos ▶'}
        </button>
        {isExpanded && (
          <p style={{ fontSize: '12px', color: 'rgba(255, 200, 200, 0.8)' }}>
            {error.message}
          </p>
        )}
      </div>
    );
  };

  return toast.error((t) => <ErrorContent toastId={t.id} />);
};

export default {
  displayError
};