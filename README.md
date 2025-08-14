# fswin32: The Ultimate Node.js Module for Windows File System Access

**fswin32** is a robust and powerful Node.js module designed to provide comprehensive and detailed information about the Windows file system. It offers a fast, asynchronous, and user-friendly way to interact with drives, files, and folders, with built-in fallbacks to PowerShell for deeper system-level details. This module is optimized for performance, minimizing costly PowerShell calls while providing rich data when needed.

---

## 🚀 Installation

To use `fswin32` in your project, install it via npm.

```bash
npm install fswin32
```

---

## 📝 Usage

To get started, you can import the module and its functions directly into your project. The module exports three main functions: `getAccessibleDrives`, `getDriveDetails`, and `getFileOrFolderDetails`.

```javascript
import {
  getAccessibleDrives,
  getDriveDetails,
  getFileOrFolderDetails
} from 'fswin32';

// Now you can use these functions in your code
// For example:
async function main() {
  const drives = await getAccessibleDrives();
  console.log('Accessible Drives:', drives);

  if (drives.length > 0) {
    const driveDetails = await getDriveDetails(drives[0]);
    console.log(`Details for drive ${drives[0]}:`, driveDetails);
  }

  const fileDetails = await getFileOrFolderDetails('C:\\Windows\\System32\\calc.exe');
  console.log('Calculator app details:', fileDetails);
}

main();
```

---

## 📦 API Reference

### `getAccessibleDrives()`

This function returns a promise that resolves to an array of accessible drive letters on the Windows system. It uses a fast, direct file system check as its primary method and falls back to a PowerShell command only if no drives are found, ensuring optimal performance.

#### Returns

`Promise<string[]>`: An array of strings, where each string is a drive letter (e.g., `['C', 'D', 'E']`).

#### Example

```javascript
import { getAccessibleDrives } from 'fswin32';

async function listDrives() {
  try {
    const drives = await getAccessibleDrives();
    console.log('Found accessible drives:', drives);
    // Expected output: ['C', 'D'] or similar
  } catch (error) {
    console.error('Failed to get drives:', error);
  }
}

listDrives();
```

---

### `getDriveDetails(driveLetter)`

This function retrieves detailed information about a specific drive, identified by its letter. It uses PowerShell to get comprehensive data like total space, free space, and volume name.

#### Parameters

-   `driveLetter` (`string`): The letter of the drive (e.g., `'C'`).

#### Returns

`Promise<object|null>`: An object containing drive details or `null` if the drive is not found or an error occurs. The object includes:
-   `drive` (`string`): The drive letter.
-   `volumeName` (`string`): The name of the volume.
-   `totalSpace` (`string`): Total space in a human-readable format (e.g., `500 GB`).
-   `freeSpace` (`string`): Free space in a human-readable format.
-   `usedSpace` (`string`): Used space in a human-readable format.
-   `totalSpaceBytes` (`number`): Total space in bytes.
-   `freeSpaceBytes` (`number`): Free space in bytes.
-   `usedSpaceBytes` (`number`): Used space in bytes.

#### Example

```javascript
import { getDriveDetails } from 'fswin32';

async function showDriveInfo() {
  const cDriveInfo = await getDriveDetails('C');
  if (cDriveInfo) {
    console.log('Drive C: Details');
    console.log('Volume Name:', cDriveInfo.volumeName);
    console.log('Total Space:', cDriveInfo.totalSpace);
    console.log('Free Space:', cDriveInfo.freeSpace);
    console.log('Used Space:', cDriveInfo.usedSpace);
  } else {
    console.log('Drive C: not found or inaccessible.');
  }
}

showDriveInfo();
```

---

### `getFileOrFolderDetails(filePath)`

This is a versatile function that provides a wealth of information about any file or folder at a given path. It includes details like size, last modified date, and ownership information (on Windows systems). For folders, it also recursively calculates the total size and counts the number of files and subfolders within it.

#### Parameters

-   `filePath` (`string`): The absolute path to the file or folder.

#### Returns

`Promise<object|null>`: An object with detailed information about the file or folder, or `null` if the path is invalid or an error occurs. The object includes:
-   `path` (`string`): The full path of the item.
-   `name` (`string`): The name of the file or folder.
-   `is_file` (`boolean`): `true` if it's a file.
-   `is_folder` (`boolean`): `true` if it's a folder.
-   `last_modified` (`Date`): The last modification timestamp.
-   `size_bytes` (`number`): The size in bytes (only for files).
-   `size_formatted` (`string`): The size in a human-readable format (only for files).
-   `owner` (`string`): The owner of the file/folder.
-   **If it's a folder, it also includes:**
    -   `total_size_bytes` (`number`): The total size of all contents inside the folder.
    -   `total_size_formatted` (`string`): The formatted total size.
    -   `contains_files_count` (`number`): The total count of files within the folder.
    -   `contains_folders_count` (`number`): The total count of subfolders within the folder.

#### Example

```javascript
import { getFileOrFolderDetails } from 'fswin32';

async function showDetails() {
  // Get details for a file
  const fileDetails = await getFileOrFolderDetails('C:\\Users\\Public\\Desktop\\example.txt');
  if (fileDetails) {
    console.log('File Details:', fileDetails);
  }

  // Get details for a folder
  const folderDetails = await getFileOrFolderDetails('C:\\Program Files');
  if (folderDetails) {
    console.log('Folder Details:', folderDetails);
  }
}

showDetails();
```

---

## ⚙️ How It Works

`fswin32` is built to be efficient and reliable. It intelligently uses the native Node.js `fs` module for basic file system operations, which are very fast. For more specific, Windows-centric information (like drive details or file ownership), it leverages `PowerShell` commands as a robust and reliable fallback mechanism. This hybrid approach ensures you get the most comprehensive data without sacrificing performance unnecessarily.

---

## 🛡️ Requirements

-   Node.js (LTS version recommended)
-   Operating System: **Windows** (This module is designed specifically for Windows file system interactions and may not function as expected on other operating systems.)

---

## 📝 License

This project is licensed under the MIT License.

```
```

I hope this documentation is helpful! Is there anything else you'd like to add or change?
