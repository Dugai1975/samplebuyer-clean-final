#!/bin/bash

# Create a backup of the original file
cp src/app/projectDetail/page.tsx src/app/projectDetail/page.tsx.bak2

# Fix the syntax issues by ensuring the AddSourceModal is properly placed within the return statement
sed -i '' 's/    <\/div>\n    \n    \/\* Add Source Modal \*\/\n    <AddSourceModal\n      visible={addSourceModal}\n      onCancel={() => setAddSourceModal(false)}\n      onAddSource={handleAddSource}\n      project={project}\n    \/>\n  );/    <\/div>\n    \n    {\/\* Add Source Modal \*\/}\n    <AddSourceModal\n      visible={addSourceModal}\n      onCancel={() => setAddSourceModal(false)}\n      onAddSource={handleAddSource}\n      project={project}\n    \/>\n  );\n}/g' src/app/projectDetail/page.tsx

echo "Fixed syntax issues in src/app/projectDetail/page.tsx"
