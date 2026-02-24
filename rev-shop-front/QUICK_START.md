# RevShop - Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### Prerequisites Check
```bash
# Verify Node.js
node --version    # Should be v18+

# Verify npm  
npm --version     # Should be v10+

# Verify Angular CLI
ng version        # Should show Angular 21+
```

### Start Development

```bash
# Navigate to project
cd rev-shop-front

# Install dependencies (if needed)
npm install

# Start development server
npm start
```

Then open: **`http://localhost:4200`**

---

## 🔑 First-Time Setup

### 1. Register Account

**As Customer:**
- Click "Register here" → "Register as Customer"
- Fill: Name, Email, Password
- Click "Register" → Auto-redirect to login

**As Admin:**
- Click "Register here" → "Register as Admin"  
- Fill: Name, Email, Password
- Click "Register" → Auto-redirect to login

### 2. Login

- Enter credentials from registration
- Click "Login"
- Auto-redirected to dashboard based on role

---

## 📊 Admin Quick Start

### Add Your First Product

1. Click **"Products"** in navbar
2. Click **"+ Add New Product"**
3. Fill form:
   - **Name**: T-Shirt
   - **Description**: High-quality cotton t-shirt
   - **Price**: 19.99
   - **Photo**: Click to upload (optional)
4. Click **"Add Product"**

### View Dashboard

1. Click **"Dashboard"** in navbar
2. See:
   - Total Orders
   - Total Revenue
   - Recent Orders Table

### Check Orders

- Orders appear automatically when customers place them
- Shows customer name, status, items count, and total

---

## 🛒 Customer Quick Start

### Browse & Shop

1. Click **"Shop"** in navbar
2. See all products displayed
3. For each product:
   - Select **Quantity** (1-10)
   - Click **"Add to Cart"**
4. Watch **cart count** in navbar increase

### Manage Cart

1. Click **cart icon** (🛒) in navbar
2. See all added items with:
   - Product name & description
   - Price per item
   - Quantity
   - Total for each item
3. To remove: Click **"Remove"** button
4. See **Cart Summary**:
   - Subtotal
   - Shipping (FREE)
   - Total

### Place Order

1. In cart, click **"Place Order"**
2. Order created from all cart items
3. Cart empties automatically
4. Redirect to order history

### View Orders

1. Click **"My Orders"** in navbar
2. See complete order history:
   - Order ID & date
   - Items in each order (name × qty)
   - Order total
   - Order status

---

## 🔐 Login/Logout

### Login
```
Email: your_email@example.com
Password: your_password
```

### Logout
Click **"Logout"** button in top-right corner
- Token cleared
- Session ended
- Redirected to login

---

## ⚠️ Important Notes

1. **Backend Required**: Ensure backend API is running on `http://localhost:8080`
2. **Role Matters**: Some pages only accessible by specific role
3. **JWT Token**: Stored in browser localStorage automatically
4. **Session**: Lasts until logout or browser closes

---

## 🛠️ Common Actions

### Change API Endpoint
Edit `src/app/core/services/auth.service.ts`:
```typescript
private apiUrl = 'http://YOUR_API_URL:8080/api/auth';
```

### Enable Debug Logs
Open browser DevTools → Console → Look for API calls

### Clear Session
```javascript
// In browser console
localStorage.clear()
location.reload()
```

---

## 📱 Features at a Glance

| Feature | Admin | Customer |
|---------|-------|----------|
| Browse Products | ✅ | ✅ |
| Add Products | ✅ | ❌ |
| Edit Products | ✅ | ❌ |
| Delete Products | ✅ | ❌ |
| View Cart | ❌ | ✅ |
| Place Orders | ❌ | ✅ |
| View Dashboard | ✅ (own) | ✅ (own) |
| View Orders | ✅ (all) | ✅ (own) |

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Check: Is backend running on port 8080?
- Check: `http://localhost:8080/api/auth/login` accessible?

### "Invalid email or password"
- Check: Account was registered?
- Check: Email/password correct?

### "No products showing"
- Check: Did admin add products?
- Check: Refresh page?

### "Cart empty"
- Check: Need to add products first?
- Check: Cleared browser cache?

### "Page not loading"
- Check: Correct URL (http://localhost:4200)?
- Check: Browser console for errors
- Try: Hard refresh (Ctrl+Shift+R)

---

## 📞 Need Help?

1. Check browser **Console** (F12)
2. Check **Network tab** for API errors
3. Verify backend is running
4. Verify API URLs in services
5. Clear cache and reload

---

## 🎯 Next Steps

✅ **Done:** Start development server on http://localhost:4200  
✅ **Next:** Register an account  
✅ **Next:** Test admin or customer features  
✅ **Next:** Build & deploy when ready  

---

**Happy Shopping! 🛍️**
