const fs = require('fs');

let content = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

// Ignore unused password
content = content.replace(
  `  const [password, setPassword] = useState('');`,
  `  // @ts-ignore\n  const [password, setPassword] = useState('');`
);

// Ignore unused setStaffUsersList
content = content.replace(
  `  const [staffUsersList, setStaffUsersList] = useState<any[]>([]);`,
  `  // @ts-ignore\n  const [staffUsersList, setStaffUsersList] = useState<any[]>([]);`
);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', content);
console.log('TS ignores added');
