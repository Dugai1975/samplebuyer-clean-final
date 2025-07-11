#!/bin/bash

# Create a backup of the original file
cp src/app/projectDetail/page.tsx src/app/projectDetail/page.tsx.bak

# Remove the duplicate state declarations
sed -i '' '1941,1946d' src/app/projectDetail/page.tsx

# Add a comment to indicate where the state variables were removed
sed -i '' '1940a\
  // State variables for tab navigation and launch modal are declared at the top level
' src/app/projectDetail/page.tsx

echo "Fixed duplicate state variables in src/app/projectDetail/page.tsx"
