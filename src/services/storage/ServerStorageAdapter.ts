import { MediaStorageAdapter, MediaFile, MediaMetadata, MediaFilter } from '../../types/media';

export class ServerStorageAdapter implements MediaStorageAdapter {
  private readonly API_URL = 'http://localhost:3000/api';

  async saveMedia(file: File, partialMetadata: Partial<MediaMetadata>): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (partialMetadata.tags) {
      formData.append('tags', JSON.stringify(partialMetadata.tags));
    }

    const response = await fetch(`${this.API_URL}/media/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    
    const metadata: MediaMetadata = {
      id: data.id,
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      mimeType: file.type,
      size: file.size,
      tags: partialMetadata.tags || [],
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };

    return {
      metadata,
      url: `http://localhost:3000${data.url}`
    };
  }

  async getMedia(id: string): Promise<MediaFile> {
    const response = await fetch(`${this.API_URL}/media/${id}`);
    
    if (!response.ok) {
      throw new Error(`Media not found: ${id}`);
    }

    const data = await response.json();
    
    return {
      metadata: {
        id: data.id,
        name: data.originalName,
        type: data.mimeType.startsWith('video/') ? 'video' : 'image',
        mimeType: data.mimeType,
        size: data.size,
        tags: data.tags || [],
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      },
      url: `http://localhost:3000${data.url}`
    };
  }

  async listMedia(filter?: MediaFilter): Promise<MediaFile[]> {
    const response = await fetch(`${this.API_URL}/media`);
    
    if (!response.ok) {
      throw new Error('Failed to list media');
    }

    const data = await response.json();
    
    let files = data.map((item: any) => ({
      metadata: {
        id: item.id,
        name: item.originalName,
        type: item.mimeType.startsWith('video/') ? 'video' : 'image',
        mimeType: item.mimeType,
        size: item.size,
        tags: item.tags || [],
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      },
      url: `http://localhost:3000${item.url}`
    }));

    if (filter) {
      if (filter.type) {
        files = files.filter(f => f.metadata.type === filter.type);
      }
      if (filter.tags?.length) {
        files = files.filter(f => 
          filter.tags!.some(tag => f.metadata.tags.includes(tag))
        );
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        files = files.filter(f =>
          f.metadata.name.toLowerCase().includes(search) ||
          f.metadata.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }
    }

    return files;
  }

  async deleteMedia(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/media/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete media');
    }
  }

  async updateMetadata(id: string, updates: Partial<MediaMetadata>): Promise<MediaFile> {
    const response = await fetch(`${this.API_URL}/media/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Failed to update metadata');
    }

    return this.getMedia(id);
  }
}
