const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../apps/web/src/pages/Staff/StaffDashboard.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add activeTab state
content = content.replace(
  "const [hamletOpen, setHamletOpen] = useState(false);",
  "const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'events' | 'cc' | 'leaves'>('overview');\n  const [hamletOpen, setHamletOpen] = useState(false);"
);

// 2. Add Tabs Navigation
const tabsNav = `
      {/* Tabs Navigation */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 90, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '24px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[
            { id: 'overview', label: 'Overview', icon: <MapPin size={16} /> },
            { id: 'surveys', label: 'Surveys', icon: <FileText size={16} /> },
            { id: 'events', label: 'Events', icon: <Award size={16} /> },
            { id: 'cc', label: 'CC Meetings', icon: <Users size={16} /> },
            { id: 'leaves', label: 'Leaves', icon: <CalendarDays size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'events') fetchEvents();
                if (tab.id === 'cc') fetchCCs();
              }}
              style={{
                background: 'none', border: 'none', padding: '16px 4px', fontSize: '0.9rem', fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? '#1B3A5C' : '#64748b', borderBottom: activeTab === tab.id ? '3px solid #2A9D8F' : '3px solid transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 200ms', whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}`;
content = content.replace("      {/* Main content */}", tabsNav);

// 3. Overview Tab wrapper
content = content.replace(
  "{/* Daily Attendance Card */}",
  "{activeTab === 'overview' && (\n        <>\n        {/* Daily Attendance Card */}"
);

content = content.replace(
  "{/* Draft / Synced lists */}",
  "        </>\n        )}\n\n        {/* Draft / Synced lists */}"
);

// 4. Surveys Tab wrapper
content = content.replace(
  "        {/* Draft / Synced lists */}",
  "        {/* Draft / Synced lists */}\n        {activeTab === 'surveys' && ("
);

content = content.replace(
  "        {/* My Leave Requests Section */}",
  "        )}\n\n        {/* My Leave Requests Section */}"
);

// 5. Leaves Tab wrapper
content = content.replace(
  "        {/* My Leave Requests Section */}",
  "        {/* My Leave Requests Section */}\n        {activeTab === 'leaves' && ("
);

content = content.replace(
  "      </main>",
  "        )}\n      </main>"
);

// 6. Change Quick Actions onClick handlers in the welcome banner to use tabs
content = content.replace(
  "setIsEventModalOpen(true);\n                  fetchEvents();",
  "setActiveTab('events');\n                  fetchEvents();"
);
content = content.replace(
  "setIsCcModalOpen(true);\n                fetchCCs();",
  "setActiveTab('cc');\n                fetchCCs();"
);
content = content.replace(
  "id=\"staff-request-leave\"\n              onClick={handleOpenLeaveModal}",
  "id=\"staff-request-leave\"\n              onClick={() => setActiveTab('leaves')}"
);
content = content.replace(
  "id=\"staff-new-survey\"\n              onClick={() => navigate('/staff/survey/new')}",
  "id=\"staff-new-survey\"\n              onClick={() => setActiveTab('surveys')}"
);

fs.writeFileSync(targetPath, content);
console.log("Updated StaffDashboard.tsx successfully!");
