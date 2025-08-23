# 🔑 Razorpay Keys Security Guide

## ⚠️ Important: Understanding Razorpay Keys

### **The Warning You're Seeing**
Vercel shows a warning about `VITE_RAZORPAY_KEY_ID` because it contains "KEY" and starts with "VITE_". This is **NORMAL and SAFE** if you're using the correct key type.

---

## 🔐 Two Types of Razorpay Keys

### **1. Publishable Key (Safe for Frontend)**
- **Format**: `rzp_test_xxxxxxxxxxxxxxxxxxxxxxxxx` or `rzp_live_xxxxxxxxxxxxxxxxxxxxxxxxx`
- **Usage**: Frontend code, client-side payments
- **Security**: Safe to expose publicly
- **Example**: `rzp_test_7nV9uK8x3PqW2eR5tY6uI9oP`

### **2. Secret Key (NEVER expose to frontend!)**
- **Format**: `rzp_secret_xxxxxxxxxxxxxxxxxxxxxxxxx`
- **Usage**: Backend only, server-side operations
- **Security**: Must be kept private
- **Example**: `rzp_secret_1aB2cD3eF4gH5iJ6kL7mN8oP`

---

## ✅ What Should You Use?

### **For `VITE_RAZORPAY_KEY_ID`:**
```env
# ✅ CORRECT - Use your PUBLISHABLE KEY
VITE_RAZORPAY_KEY_ID=rzp_test_7nV9uK8x3PqW2eR5tY6uI9oP

# ❌ WRONG - NEVER use your SECRET KEY
# VITE_RAZORPAY_KEY_ID=rzp_secret_1aB2cD3eF4gH5iJ6kL7mN8oP
```

---

## 🔍 How to Find Your Keys

### **In Razorpay Dashboard:**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys**
3. Look for:
   - **Key ID** (Publishable) - Use this one ✅
   - **Secret Key** (Secret) - Keep this private ❌

### **For Test Mode:**
- Use keys from your **Test Mode** environment
- Test keys start with `rzp_test_`

### **For Production:**
- Use keys from your **Live Mode** environment
- Live keys start with `rzp_live_`

---

## 🚨 Security Checklist

### **✅ Safe Configuration:**
- [ ] `VITE_RAZORPAY_KEY_ID` uses publishable key (starts with `rzp_test_` or `rzp_live_`)
- [ ] Secret key is NOT exposed to frontend
- [ ] Environment variables are properly set in Vercel
- [ ] Keys are different for test and production environments

### **❌ Dangerous Configuration:**
- [ ] Using secret key in frontend code
- [ ] Exposing `rzp_secret_` keys to client-side
- [ ] Hardcoding keys in source code
- [ ] Sharing secret keys in repositories

---

## 🔧 Quick Fix for Vercel Warning

If you're seeing the warning and want to verify:

1. **Check your environment variable** in Vercel dashboard
2. **Confirm it starts with** `rzp_test_` or `rzp_live_` (not `rzp_secret_`)
3. **If correct**: The warning is safe to ignore - this is expected behavior
4. **If wrong**: Replace with your publishable key immediately

---

## 📞 Need Help?

If you're unsure about your keys:
1. Go to Razorpay Dashboard → Settings → API Keys
2. Use the **Key ID** (publishable key) for `VITE_RAZORPAY_KEY_ID`
3. Never use the **Secret Key** in frontend code

**Your publishable key is designed to be public and safe for frontend use!** 🎉
