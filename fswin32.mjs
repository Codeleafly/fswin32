// fswin32.js

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import os from 'os';

const execPromise = util.promisify(exec);

/**
 * fswin - The ultimate Node.js module for detailed Windows file system access.
 * This version is highly robust, integrating PowerShell fallbacks for core functionality.
 * It provides comprehensive details about drives, files, and folders.
 * Developed and Trained by Smart Tell Line.
 */

// --- Helper Functions ---

/**
 * Converts bytes to a human-readable format (e.g., KB, MB, GB).
 * @param {number} bytes The size in bytes.
 * @param {number} decimals The number of decimal places.
 * @returns {string} The formatted size string.
 */
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Executes a PowerShell command and returns the output.
 * @param {string} command The PowerShell command to execute.
 * @returns {Promise<string|null>} The stdout of the command or null on error.
 */
const executePowerShellCommand = async (command) => {
    try {
        const { stdout } = await execPromise(`powershell "${command}"`);
        return stdout;
    } catch (error) {
        console.error('PowerShell command failed:', error.message);
        return null;
    }
};

// --- Core Module Functions ---

/**
 * Gets a list of accessible Windows drives. Uses fs.access with PowerShell as a fallback.
 * @returns {Promise<Array<string>>} An array of accessible drive letters.
 */
export const getAccessibleDrives = async () => {
    let drives = [];
    // Primary method: fs.access
    for (let i = 65; i <= 90; i++) {
        const driveLetter = String.fromCharCode(i);
        const drivePath = `${driveLetter}:\\`;
        try {
            await fs.access(drivePath);
            drives.push(driveLetter);
        } catch (error) { /* continue */ }
    }
    if (drives.length > 0) return drives;

    // Fallback method: PowerShell
    const stdout = await executePowerShellCommand('Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID');
    if (stdout) {
        stdout.split('\n').forEach(line => {
            const match = line.match(/^([A-Z]):/);
            if (match) drives.push(match[1]);
        });
    }
    return [...new Set(drives)];
};

/**
 * Gets detailed information about a specific Windows drive using PowerShell.
 * @param {string} driveLetter The letter of the drive (e.g., 'C').
 * @returns {Promise<Object|null>} An object with drive details or null on failure.
 */
export const getDriveDetails = async (driveLetter) => {
    const stdout = await executePowerShellCommand(`Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DeviceID -eq '${driveLetter}:'} | Select-Object Size, FreeSpace, VolumeName`);
    if (stdout) {
        const lines = stdout.split('\n').filter(Boolean);
        if (lines.length > 1) {
            const data = lines[1].trim().split(/\s+/);
            const totalSpaceBytes = parseInt(data[0]);
            const freeSpaceBytes = parseInt(data[1]);
            const volumeName = data[2] ? data[2] : 'N/A';
            const usedSpaceBytes = totalSpaceBytes - freeSpaceBytes;

            return {
                drive: driveLetter,
                volumeName: volumeName,
                totalSpace: formatBytes(totalSpaceBytes),
                freeSpace: formatBytes(freeSpaceBytes),
                usedSpace: formatBytes(usedSpaceBytes),
                totalSpaceBytes,
                freeSpaceBytes,
                usedSpaceBytes,
            };
        }
    }
    return null;
};

/**
 * Gets detailed information about a specific file or folder, including owner details.
 * @param {string} filePath The absolute path of the file or folder.
 * @returns {Promise<Object|null>} An object with detailed information.
 */
export const getFileOrFolderDetails = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);
        let owner = 'N/A';
        const isWindows = os.platform() === 'win32';
        if (isWindows) {
            const stdout = await executePowerShellCommand(`(Get-Item -Path "${filePath}").GetAccessControl().Owner`);
            if (stdout) {
                owner = stdout.trim();
            }
        }

        const details = {
            path: filePath,
            name: path.basename(filePath),
            is_file: stats.isFile(),
            is_folder: stats.isDirectory(),
            last_modified: stats.mtime,
            size_bytes: stats.size,
            size_kb: (stats.size / 1024).toFixed(2),
            size_formatted: formatBytes(stats.size),
            owner: owner,
        };

        if (stats.isDirectory()) {
            const { totalSize, fileCount, folderCount } = await getFolderSizeAndCount(filePath);
            details.total_size_bytes = totalSize;
            details.total_size_kb = (totalSize / 1024).toFixed(2);
            details.total_size_formatted = formatBytes(totalSize);
            details.contains_files_count = fileCount;
            details.contains_folders_count = folderCount;
        }
        return details;
    } catch (error) {
        console.error(`Error getting details for ${filePath}:`, error.message);
        return null;
    }
};

/**
 * Recursively calculates the size of a folder and counts its contents.
 * @param {string} folderPath The absolute path of the folder.
 * @returns {Promise<{totalSize: number, fileCount: number, folderCount: number}>}
 */
const getFolderSizeAndCount = async (folderPath) => {
    let totalSize = 0;
    let fileCount = 0;
    let folderCount = 0;
    try {
        const items = await fs.readdir(folderPath, { withFileTypes: true });
        for (const item of items) {
            const itemPath = path.join(folderPath, item.name);
            try {
                const stats = await fs.stat(itemPath);
                if (stats.isDirectory()) {
                    folderCount++;
                    const subFolderInfo = await getFolderSizeAndCount(itemPath);
                    totalSize += subFolderInfo.totalSize;
                    fileCount += subFolderInfo.fileCount;
                    folderCount += subFolderInfo.folderCount;
                } else if (stats.isFile()) {
                    fileCount++;
                    totalSize += stats.size;
                }
            } catch (err) { /* Ignore inaccessible files/folders */ }
        }
    } catch (error) { /* Ignore inaccessible parent folder */ }
    return { totalSize, fileCount, folderCount };
};
