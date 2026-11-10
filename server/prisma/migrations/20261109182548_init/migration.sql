-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Address" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "landmark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Food" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "price" INTEGER NOT NULL,
    "servingSize" TEXT,
    "calories" REAL,
    "protein" REAL,
    "carbohydrates" REAL,
    "fat" REAL,
    "notes" TEXT,
    "prepTimeMinutes" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Food_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "foodId" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,
    "prepTimeMinutes" INTEGER,
    "cookTimeMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recipe_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "stockQuantity" REAL NOT NULL DEFAULT 0,
    "reorderLevel" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FoodIngredient" (
    "foodId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,

    PRIMARY KEY ("foodId", "ingredientId"),
    CONSTRAINT "FoodIngredient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FoodIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngredientStockMovement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredientId" INTEGER NOT NULL,
    "userId" INTEGER,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IngredientStockMovement_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IngredientStockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cartId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "addressId" INTEGER,
    "deliveryName" TEXT NOT NULL,
    "deliveryPhone" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryCity" TEXT NOT NULL,
    "deliveryState" TEXT NOT NULL,
    "deliveryPincode" TEXT NOT NULL,
    "deliveryLandmark" TEXT,
    "subtotal" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "cancelReason" TEXT,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "foodName" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "changedById" INTEGER,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "amount" INTEGER NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "failureReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "partnerId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'UNASSIGNED',
    "assignedAt" DATETIME,
    "acceptedAt" DATETIME,
    "pickedUpAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Delivery_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeliveryEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deliveryId" INTEGER NOT NULL,
    "actorId" INTEGER,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryEvent_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeliveryEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "moderatedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ingredients" TEXT,
    "recipe" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedById" INTEGER,
    "reviewedAt" DATETIME,
    "approvedFoodId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Suggestion_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Suggestion_approvedFoodId_fkey" FOREIGN KEY ("approvedFoodId") REFERENCES "Food" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Suggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Food_categoryId_idx" ON "Food"("categoryId");

-- CreateIndex
CREATE INDEX "Food_name_idx" ON "Food"("name");

-- CreateIndex
CREATE INDEX "Food_isPublished_isAvailable_idx" ON "Food"("isPublished", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_foodId_key" ON "Recipe"("foodId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- CreateIndex
CREATE INDEX "FoodIngredient_ingredientId_idx" ON "FoodIngredient"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientStockMovement_ingredientId_createdAt_idx" ON "IngredientStockMovement"("ingredientId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "CartItem_foodId_idx" ON "CartItem"("foodId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_foodId_key" ON "CartItem"("cartId", "foodId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_foodId_idx" ON "OrderItem"("foodId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON "Payment"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Payment_orderId_status_idx" ON "Payment"("orderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- CreateIndex
CREATE INDEX "Delivery_partnerId_status_idx" ON "Delivery"("partnerId", "status");

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE INDEX "DeliveryEvent_deliveryId_createdAt_idx" ON "DeliveryEvent"("deliveryId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderItemId_key" ON "Review"("orderItemId");

-- CreateIndex
CREATE INDEX "Review_foodId_status_idx" ON "Review"("foodId", "status");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Suggestion_approvedFoodId_key" ON "Suggestion"("approvedFoodId");

-- CreateIndex
CREATE INDEX "Suggestion_status_createdAt_idx" ON "Suggestion"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Suggestion_userId_idx" ON "Suggestion"("userId");
