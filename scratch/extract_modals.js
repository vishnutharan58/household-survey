const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../apps/web/src/pages/Staff/StaffDashboard.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Move CC Meetings into main
const ccModalStartStr = "{/* CC Meetings Modal */}\n      {isCcModalOpen && (";
const ccModalEndStr = "        </div>\n      )}";

// 2. We can just use string replace.
// Actually, it's easier to use a regex to capture the modal bodies.

// Replace CC modal start with tab start
content = content.replace(
  "{/* CC Meetings Modal */}\n      {isCcModalOpen && (\n        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>\n          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '700px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>",
  "{/* CC Meetings Tab */}\n      {activeTab === 'cc' && (\n        <div className=\"chart-card animate-fade-in-up\" style={{ marginTop: '24px', padding: '28px' }}>"
);

// Remove the close button section from CC modal
content = content.replace(
  "              <button\n                onClick={() => setIsCcModalOpen(false)}\n                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}\n              >\n                <X size={16} />\n              </button>",
  ""
);

content = content.replace(
  "            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>\n              <button\n                onClick={() => setIsCcModalOpen(false)}\n                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}\n              >\n                Close\n              </button>\n            </div>",
  ""
);

// End of CC Tab
content = content.replace(
  "            </div>\n          </div>\n        </div>\n      )}",
  "            </div>\n        </div>\n      )}"
);

// Move Events into main
content = content.replace(
  "{/* Add Event Details Modal */}\n      {isEventModalOpen && (\n        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>\n          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '600px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>",
  "{/* Events Tab */}\n      {activeTab === 'events' && (\n        <div className=\"chart-card animate-fade-in-up\" style={{ marginTop: '24px', padding: '28px', maxWidth: '700px', margin: '24px auto 0' }}>"
);

// Remove the close button section from Event modal
content = content.replace(
  "              <button\n                onClick={() => setIsEventModalOpen(false)}\n                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}\n              >\n                <X size={16} />\n              </button>",
  ""
);

// End of Event Tab
content = content.replace(
  "              </div>\n            </div>\n          </div>\n        </div>\n      )}",
  "              </div>\n            </div>\n        </div>\n      )}"
);

// Now we need to move the blocks into <main>.
// Let's do it by regex.

let mainBlockRegex = /<main[^>]*>([\s\S]*?)<\/main>/;
let mainMatch = content.match(mainBlockRegex);

if (mainMatch) {
  let mainContent = mainMatch[1];
  
  // Extract Events tab block
  let eventRegex = /\{\/\* Events Tab \*\/\}[\s\S]*?\{activeTab === 'events' && \([\s\S]*?\}\)/;
  let eventMatch = content.match(eventRegex);
  
  // Extract CC tab block
  let ccRegex = /\{\/\* CC Meetings Tab \*\/\}[\s\S]*?\{activeTab === 'cc' && \([\s\S]*?\}\)/;
  let ccMatch = content.match(ccRegex);

  if (eventMatch && ccMatch) {
    // Remove them from current position
    content = content.replace(eventMatch[0], '');
    content = content.replace(ccMatch[0], '');
    
    // Append them right before </main>
    content = content.replace('      </main>', `\n${eventMatch[0]}\n\n${ccMatch[0]}\n      </main>`);
  }
}

fs.writeFileSync(targetPath, content);
console.log("Updated StaffDashboard.tsx successfully!");
