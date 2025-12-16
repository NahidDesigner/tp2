import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  bn: {
    translation: {
      // Common
      "welcome": "স্বাগতম",
      "login": "লগইন",
      "logout": "লগআউট",
      "save": "সংরক্ষণ",
      "cancel": "বাতিল",
      "delete": "মুছুন",
      "edit": "সম্পাদনা",
      "add": "যোগ করুন",
      "search": "খুঁজুন",
      "loading": "লোড হচ্ছে...",
      "error": "ত্রুটি",
      "success": "সফল",
      
      // Auth
      "phone": "মোবাইল নম্বর",
      "otp": "OTP",
      "request_otp": "OTP চাই",
      "verify_otp": "OTP যাচাই করুন",
      
      // Store
      "stores": "স্টোর",
      "create_store": "নতুন স্টোর",
      "store_name": "স্টোরের নাম",
      "subdomain": "সাবডোমেইন",
      
      // Products
      "products": "পণ্য",
      "create_product": "নতুন পণ্য",
      "product_name": "পণ্যের নাম",
      "price": "দাম",
      "stock": "স্টক",
      
      // Orders
      "orders": "অর্ডার",
      "order_number": "অর্ডার নম্বর",
      "status": "স্ট্যাটাস",
      "pending": "অপেক্ষমান",
      "confirmed": "নিশ্চিত",
      "processing": "প্রক্রিয়াকরণ",
      "shipped": "শিপড",
      "delivered": "ডেলিভার্ড",
      "cancelled": "বাতিল",
      "dashboard": "ড্যাশবোর্ড",
      
      // Checkout
      "checkout": "চেকআউট",
      "customer_name": "গ্রাহকের নাম",
      "shipping_address": "ডেলিভারি ঠিকানা",
      "place_order": "অর্ডার করুন",
    }
  },
  en: {
    translation: {
      // Common
      "welcome": "Welcome",
      "login": "Login",
      "logout": "Logout",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "add": "Add",
      "search": "Search",
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      
      // Auth
      "phone": "Phone Number",
      "otp": "OTP",
      "request_otp": "Request OTP",
      "verify_otp": "Verify OTP",
      
      // Store
      "stores": "Stores",
      "create_store": "Create Store",
      "store_name": "Store Name",
      "subdomain": "Subdomain",
      
      // Products
      "products": "Products",
      "create_product": "Create Product",
      "product_name": "Product Name",
      "price": "Price",
      "stock": "Stock",
      
      // Orders
      "orders": "Orders",
      "order_number": "Order Number",
      "status": "Status",
      "pending": "Pending",
      "confirmed": "Confirmed",
      "processing": "Processing",
      "shipped": "Shipped",
      "delivered": "Delivered",
      "cancelled": "Cancelled",
      "dashboard": "Dashboard",
      
      // Checkout
      "checkout": "Checkout",
      "customer_name": "Customer Name",
      "shipping_address": "Shipping Address",
      "place_order": "Place Order",
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'bn',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n

