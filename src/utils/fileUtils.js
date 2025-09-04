import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import logger from './logger';

class FileUtils {
  // Ensure directory exists
  static ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Delete file safely
  static async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info(`File deleted: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file information
  static getFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath);

      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: ext,
        name: path.basename(filePath),
        directory: path.dirname(filePath)
      };
    } catch (error) {
      logger.error('Error getting file info:', error);
      return null;
    }
  }

  // Resize and optimize image
  static async optimizeImage(inputPath, outputPath, options = {}) {
    try {
      const {
        width = 1200,
        height = 1600,
        quality = 85,
        format = 'jpeg'
      } = options;

      await sharp(inputPath)
        .resize(width, height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality })
        .toFile(outputPath);

      logger.info(`Image optimized: ${inputPath} -> ${outputPath}`);
      return true;
    } catch (error) {
      logger.error('Error optimizing image:', error);
      return false;
    }
  }

  // Generate thumbnail
  static async generateThumbnail(inputPath, outputPath, size = 300) {
    try {
      await sharp(inputPath)
        .resize(size, size, { 
          fit: 'cover',
          position: 'center' 
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      logger.info(`Thumbnail generated: ${outputPath}`);
      return true;
    } catch (error) {
      logger.error('Error generating thumbnail:', error);
      return false;
    }
  }

  // Validate image file
  static async validateImage(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();

      return {
        valid: true,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size
      };
    } catch (error) {
      logger.error('Error validating image:', error);
      return { valid: false, error: error.message };
    }
  }

  // Clean up old files
  static async cleanupOldFiles(directory, maxAgeInDays = 30) {
    try {
      const files = fs.readdirSync(directory);
      const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteFile(filePath);
          deletedCount++;
        }
      }

      logger.info(`Cleaned up ${deletedCount} old files from ${directory}`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up old files:', error);
      return 0;
    }
  }
}


export default FileUtils;
