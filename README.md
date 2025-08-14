# fswin32: Windows File System Utilities for Node.js

**fswin32** is a robust and powerful Node.js module designed for comprehensive interaction with the Windows file system. It leverages both native Node.js `fs` methods and reliable PowerShell commands to provide detailed information about drives, files, and folders, ensuring high accuracy and reliability.

---

### Installation

To get started, simply install the module using npm:

```bash
npm install fswin32
```

---

### Usage

First, import the functions you need from the module:

```javascript
import { getAccessibleDrives, getDriveDetails, getFileOrFolderDetails } from 'fswin32';
```

---

### Function Reference

This section provides a detailed explanation of each function, including its purpose, parameters, return value, and a clear code example.

#### `getAccessibleDrives()`

This function retrieves a list of all accessible drive letters on the Windows system. It uses a robust approach by first attempting to access drives natively and then falling back to a PowerShell command to ensure all drives are found, even those with unusual permissions.

-   **Returns:** A `Promise` that resolves to an `Array<string>`, containing a list of all accessible drive letters (e.g., `['C', 'D', 'E']`).

**Example:**

```javascript
// Import the function
import { getAccessibleDrives } from 'fswin32';

async function listAllDrives() {
  try {
    // Get the list of all accessible drives
    const drives = await getAccessibleDrives();

    // Log the result to the console
    console.log('Accessible Drives:', drives); 
    // Example Output: Accessible Drives: ['C', 'D', 'E']
  } catch (error) {
    console.error('Failed to get drives:', error);
  }
}

listAllDrives();
```

---

#### `getDriveDetails(driveLetter)`

This function provides **detailed information about a specific drive**. It uses PowerShell to gather comprehensive data that isn't available through standard Node.js methods, such as total capacity, available free space, and the volume's name.

-   **`driveLetter`:** A `string` representing the drive letter (e.g., `'C'`). It is case-insensitive.
-   **Returns:** A `Promise` that resolves to an `Object` with drive details or `null` if the drive is not found.

**The returned object will have the following properties:**

| Property | Type | Description |
| :--- | :--- | :--- |
| `drive` | `string` | The drive letter. |
| `volumeName` | `string` | The volume name of the drive (e.g., "OS"). |
| `totalSpace` | `string` | The total capacity in a human-readable format. |
| `freeSpace` | `string` | The available free space in a human-readable format. |
| `usedSpace` | `string` | The used space in a human-readable format. |
| `totalSpaceBytes` | `number` | The total capacity in bytes. |
| `freeSpaceBytes` | `number` | The available free space in bytes. |
| `usedSpaceBytes` | `number` | The used space in bytes. |

**Example:**

```javascript
// Import the function
import { getDriveDetails } from 'fswin32';

async function logCDriveDetails() {
  // Get details for the 'C' drive
  const driveInfo = await getDriveDetails('C');

  if (driveInfo) {
    // Log the full object to the console
    console.log('Drive Info:', driveInfo);
    
    // Access specific properties
    console.log(`Drive Information for ${driveInfo.drive}:\\`);
    console.log(`  - Volume Name: ${driveInfo.volumeName}`);
    console.log(`  - Total Size:  ${driveInfo.totalSpace}`);
    console.log(`  - Free Space:  ${driveInfo.freeSpace}`);
  } else {
    console.error('Drive C not found or is inaccessible.');
  }
}

logCDriveDetails();
```

---

#### `getFileOrFolderDetails(filePath)`

This is the most powerful and versatile function in the module. It provides extensive details about any file or folder. It automatically detects if the path is a file or a directory and provides relevant, granular information. For folders, it recursively calculates the total size and counts all contained files and sub-folders. It also retrieves the file or folder owner, a feature not typically available in standard Node.js.

-   **`filePath`:** A `string` representing the absolute path to the file or folder (e.g., `'C:\\Users\\admin\\Documents'`).
-   **Returns:** A `Promise` that resolves to a detailed `Object`. It returns `null` if the path does not exist or is inaccessible.

**Returned Object Properties:**

| Property | Type | Applies to | Description |
| :--- | :--- | :--- | :--- |
| `path` | `string` | Both | The full absolute path. |
| `name` | `string` | Both | The name of the file or folder. |
| `is_file` | `boolean` | Both | `true` if the path is a file. |
| `is_folder` | `boolean` | Both | `true` if the path is a folder. |
| `last_modified` | `Date` | Both | The last modification timestamp. |
| `owner` | `string` | Both | The owner of the file or folder. |
| `size_formatted` | `string` | File only | The file size in a human-readable format. |
| `total_size_formatted` | `string` | Folder only | The total size of the folder and its contents. |
| `contains_files_count` | `number` | Folder only | The total number of files inside the folder and its subfolders. |
| `contains_folders_count` | `number` | Folder only | The total number of subfolders inside the folder. |

**Example:**

```javascript
// Import the function
import { getFileOrFolderDetails } from 'fswin32';

async function logPathDetails() {
  // Get details for a file
  const fileDetails = await getFileOrFolderDetails('C:\\Windows\\System32\\calc.exe');
  if (fileDetails) {
    console.log('--- File Details ---');
    console.log(`Name: ${fileDetails.name}`);
    console.log(`Size: ${fileDetails.size_formatted}`);
    console.log(`Owner: ${fileDetails.owner}`);
  }

  console.log('\n');

  // Get details for a folder
  const folderDetails = await getFileOrFolderDetails('C:\\Program Files');
  if (folderDetails) {
    console.log('--- Folder Details ---');
    console.log(`Name: ${folderDetails.name}`);
    console.log(`Total Size: ${folderDetails.total_size_formatted}`);
    console.log(`Total Files: ${folderDetails.contains_files_count}`);
    console.log(`Total Folders: ${folderDetails.contains_folders_count}`);
  }
}

logPathDetails();
```
