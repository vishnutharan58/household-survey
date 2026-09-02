const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps/web/src/pages/Admin/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const leavePollingLogic = `
  // Leave Request Polling for Notification
  const [toastNotification, setToastNotification] = useState<{message: string, visible: boolean}>({message: '', visible: false});
  const prevPendingLeaves = useRef<number>(0);

  useEffect(() => {
    // Initial fetch handled above, now set up polling
    const interval = setInterval(async () => {
      try {
        const data = await fetchLeaveRequestsFromSupabase();
        if (data && data.length > 0) {
          setLeaveRequests(data);
          const currentPending = data.filter((r: any) => r.status === 'pending').length;
          if (currentPending > prevPendingLeaves.current && prevPendingLeaves.current !== 0) {
            // Show toast
            setToastNotification({ message: 'New Leave Request Received!', visible: true });
            setTimeout(() => setToastNotification({ message: '', visible: false }), 5000);
          }
          prevPendingLeaves.current = currentPending;
        }
      } catch (err) {
        console.warn("Leave polling error:", err);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);
`;

if (!content.includes('Leave Request Polling')) {
  // Find where useEffect is imported and ensure useRef is there
  if (!content.includes('useRef')) {
    content = content.replace(/import React, \{ useState, useEffect/g, 'import React, { useState, useEffect, useRef');
  }

  // Inject logic inside AdminDashboard component
  content = content.replace(
    /(const TABS: Array<\{)/,
    `${leavePollingLogic}\n  $1`
  );

  // Add the Toast UI at the end of the return statement
  const toastUI = `
      {/* Toast Notification */}
      {toastNotification.visible && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#10b981', color: 'white',
          padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 9999, fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fadeIn 0.3s'
        }}>
          <Bell size={18} />
          {toastNotification.message}
        </div>
      )}
  `;

  content = content.replace(
    /(\n\s*<\/div>\n\s*\);)/,
    `${toastUI}$1`
  );

  fs.writeFileSync(filePath, content);
  console.log('Updated AdminDashboard.tsx with Leave Notification Polling');
} else {
  console.log('Leave Notification Polling already exists');
}
