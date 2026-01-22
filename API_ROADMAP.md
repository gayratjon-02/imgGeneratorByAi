# AI Product Image Generation - API Roadmap

## 📋 Kerakli API Endpointlar

### 1. **Product Management APIs**

#### 1.1 Create Product (with image upload)
```
POST /api/products
Headers: Authorization: Bearer <token>
Body: FormData
  - name: string
  - color: string
  - material: string
  - frontImage: File
  - backImage: File
Response: { product, frontImageUrl, backImageUrl }
```

#### 1.2 Get All Products (by user)
```
GET /api/products
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=10
Response: { products[], total, page, limit }
```

#### 1.3 Get Single Product
```
GET /api/products/:id
Headers: Authorization: Bearer <token>
Response: { product }
```

#### 1.4 Update Product
```
PUT /api/products/:id
Headers: Authorization: Bearer <token>
Body: { name?, color?, material? }
Response: { product }
```

#### 1.5 Delete Product
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token>
Response: { message: "Product deleted" }
```

---

### 2. **AI Generation APIs**

#### 2.1 Start AI Generation
```
POST /api/generations
Headers: Authorization: Bearer <token>
Body: {
  productId: string,
  model: string (default: "gemini-pro-vision")
}
Response: { 
  generation: { _id, status: "PENDING", productId },
  message: "Generation started"
}
```

#### 2.2 Get Generation Status
```
GET /api/generations/:id
Headers: Authorization: Bearer <token>
Response: {
  generation: {
    _id,
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    productId,
    generatedImages: [],
    completedAt,
    createdAt
  }
}
```

#### 2.3 Get All Generations (by user)
```
GET /api/generations
Headers: Authorization: Bearer <token>
Query: ?status=COMPLETED&page=1&limit=10
Response: { generations[], total, page, limit }
```

#### 2.4 Cancel Generation
```
DELETE /api/generations/:id
Headers: Authorization: Bearer <token>
Response: { message: "Generation cancelled" }
```

---

### 3. **Image Download APIs**

#### 3.1 Download All Generated Images (ZIP)
```
GET /api/generations/:id/download
Headers: Authorization: Bearer <token>
Response: ZIP file with all generated images
```

#### 3.2 Download Single Image
```
GET /api/images/:imageId
Headers: Authorization: Bearer <token>
Response: Image file
```

---

### 4. **File Upload APIs**

#### 4.1 Upload Product Images
```
POST /api/upload/product-images
Headers: Authorization: Bearer <token>
Body: FormData
  - frontImage: File
  - backImage: File
Response: { frontImageUrl, backImageUrl }
```

---

## 🏗️ Komponentlar Strukturasi

```
src/components/
├── products/
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── dto/
│       ├── create-product.dto.ts
│       └── update-product.dto.ts
│
├── generations/
│   ├── generations.module.ts
│   ├── generations.controller.ts
│   ├── generations.service.ts
│   ├── gemini.service.ts (Google Gemini API integration)
│   └── dto/
│       ├── create-generation.dto.ts
│       └── generation-status.dto.ts
│
└── upload/
    ├── upload.module.ts
    ├── upload.controller.ts
    ├── upload.service.ts
    └── config/
        └── multer.config.ts
```

---

## 🔧 Texnik Maslahatlar

### 1. **File Upload (Multer)**
- **Kutubxona**: `@nestjs/platform-express` + `multer`
- **Storage**: Local yoki Cloud (AWS S3, Cloudinary)
- **Validation**: File size, type (jpg, png, webp)
- **Path**: `uploads/products/` va `uploads/generated/`

### 2. **Google Gemini API Integration**
- **Kutubxona**: `@google/generative-ai`
- **Service**: `GeminiService` yaratish
- **Prompts**: 6 ta turli prompt (duo shots, solo shots, flat lays, close-ups)
- **Async Processing**: Background job yoki queue (Bull/BullMQ)

### 3. **Background Job Processing**
- **Variant 1**: `@nestjs/bull` + Redis (tavsiya etiladi)
- **Variant 2**: `@nestjs/schedule` (cron) - oddiy variant
- **Queue**: Generation job larni queue ga qo'yish

### 4. **Image Storage**
- **Development**: Local storage (`./uploads/`)
- **Production**: Cloud storage (AWS S3, Cloudinary, Google Cloud Storage)
- **CDN**: CloudFront yoki Cloudflare

### 5. **ZIP Download**
- **Kutubxona**: `archiver` yoki `adm-zip`
- **Streaming**: Katta fayllar uchun streaming response

### 6. **Progress Tracking**
- **WebSocket**: Real-time progress updates
- **Polling**: Frontend dan status tekshirish (oddiy variant)

---

## 📦 Qo'shimcha Dependencies

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.2.0",
    "multer": "^1.4.5-lts.1",
    "@types/multer": "^1.4.11",
    "archiver": "^6.0.1",
    "@nestjs/bull": "^10.0.1",
    "bull": "^4.12.0",
    "redis": "^4.6.0"
  }
}
```

---

## 🎯 Development Ketma-ketligi

### Phase 1: Product Management
1. ✅ Auth tizimi (tayyor)
2. ⏳ Product CRUD APIs
3. ⏳ File upload (Multer)
4. ⏳ Image storage

### Phase 2: AI Generation
5. ⏳ Google Gemini API integration
6. ⏳ Generation service
7. ⏳ Background job processing
8. ⏳ Status tracking

### Phase 3: Download & Optimization
9. ⏳ ZIP download
10. ⏳ Image optimization
11. ⏳ Caching
12. ⏳ Error handling

---

## 🔐 Security Considerations

1. **File Upload**:
   - File type validation
   - File size limit (max 10MB)
   - Virus scanning (optional)

2. **Rate Limiting**:
   - Generation limit per user/day
   - API rate limiting

3. **Authentication**:
   - JWT token (tayyor)
   - Role-based access (tayyor)

---

## 📊 Database Optimizations

1. **Indexes**:
   - `Product.userId` - user products uchun
   - `AIGeneration.userId` - user generations uchun
   - `AIGeneration.status` - status filter uchun

2. **Pagination**:
   - Barcha list API larda pagination

3. **Caching**:
   - Redis cache (generated images)

---

## 🚀 Production Ready Features

1. **Error Handling**:
   - Global exception filter
   - Detailed error messages

2. **Logging**:
   - Winston yoki Pino
   - Request/Response logging (tayyor)

3. **Monitoring**:
   - Health check endpoint
   - Metrics collection

4. **Documentation**:
   - Swagger/OpenAPI

---

## 💡 Maslahatlar

1. **Start Simple**: Avval basic CRUD, keyin AI integration
2. **Test Locally**: Google Gemini API ni local test qiling
3. **Queue System**: Background job uchun Bull/BullMQ ishlating
4. **Image Optimization**: Generated images ni optimize qiling
5. **Error Recovery**: Failed generation larni retry qilish
6. **User Experience**: Progress bar va real-time updates
7. **Cost Management**: API call limit va caching
