import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ====================================================================
// ICONS
// ====================================================================

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// Helper function for Tk formatting
const formatToTk = (amount) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace("BDT", "Tk");

// ====================================================================
// SKELETON LOADERS
// ====================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
  <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
    <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 space-x-4">
      {[...Array(11)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/12" />)}
    </div>
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center px-4 py-4 border-b border-gray-100 space-x-4">
        <SkeletonPulse className="h-4 w-8" />
        <SkeletonPulse className="h-4 w-20" />
        <SkeletonPulse className="h-10 w-10 rounded-md" />
        <SkeletonPulse className="h-4 w-32" />
        <SkeletonPulse className="h-6 w-16 rounded-lg" />
        <SkeletonPulse className="h-4 w-12" />
        <SkeletonPulse className="h-4 w-12" />
        <SkeletonPulse className="h-4 w-16" />
        <SkeletonPulse className="h-4 w-16" />
        <SkeletonPulse className="h-4 w-10" />
        <SkeletonPulse className="h-4 w-10" />
        <div className="flex space-x-2 ml-auto">
           <SkeletonPulse className="h-8 w-8 rounded-lg" />
           <SkeletonPulse className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// ====================================================================
// MAIN COMPONENT
// ====================================================================

const AllProduct = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewImage, setViewImage] = useState(null);

  const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
  const token = localStorage.getItem("authToken");

  // --- React Query: Fetch Categories ---
  const { data: categories = [], isLoading: categoryLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/categories?limit=100`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      return data.data ? data.data.filter((c) => c.type === "product") : [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // --- React Query: Fetch Suppliers ---
  const { data: suppliers = [], isLoading: supplierLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/suppliers?limit=100`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load suppliers");
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
  });

  // --- React Query: Fetch Products ---
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/products?per_page=10000`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!token,
  });

  // --- React Query: Mutation for Save (Create/Update) ---
  const saveProductMutation = useMutation({
    mutationFn: async ({ formValues, isEdit, productId }) => {
    // Use POST for both create and update when using FormData (to support file uploads)
    // For updates, we append _method: 'PUT' for Laravel/PHP compatibility
    const method = "POST";
    const url = isEdit ? `${API_BASE}/products/${productId}` : `${API_BASE}/products`;

    const formData = new FormData();
    formData.append("name", formValues.name);
    formData.append("category_id", formValues.category_id);
    formData.append("product_type", formValues.product_type);
    formData.append("price", parseFloat(formValues.price));
    formData.append("down_payment", parseFloat(formValues.down_payment) || 0);
    formData.append("stock_qty", parseInt(formValues.stock_qty));
    formData.append("min_stock_alert", parseInt(formValues.min_stock_alert));
    formData.append("ccu_percentage", parseFloat(formValues.ccu_percentage));
    formData.append("is_stock_managed", 1);

    if (formValues.supplier_id) formData.append("supplier_id", parseInt(formValues.supplier_id));
    if (formValues.supplier_percentage) formData.append("supplier_percentage", parseFloat(formValues.supplier_percentage));
    if (formValues.supplier_down_payment_percentage) formData.append("supplier_down_payment_percentage", parseFloat(formValues.supplier_down_payment_percentage));
    if (formValues.description) formData.append("description", formValues.description);
    if (formValues.images && formValues.images.length > 0) {
      for (let i = 0; i < formValues.images.length; i++) {
        formData.append("images[]", formValues.images[i]);
      }
    }

    // Handle Single Image
    if (formValues.image instanceof File) {
      formData.append("image", formValues.image);
    }

    // Handle Attributes (Object -> Array notation for FormData)
    if (formValues.attributes && typeof formValues.attributes === 'object') {
      Object.keys(formValues.attributes).forEach(key => {
        formData.append(`attributes[${key}]`, formValues.attributes[key]);
      });
    }

    // Handle EMI Plans (Array of Objects -> Array notation)
    if (formValues.emi_plans && Array.isArray(formValues.emi_plans)) {
      formValues.emi_plans.forEach((plan, index) => {
        formData.append(`emi_plans[${index}][tenure_months]`, plan.tenure_months);
        formData.append(`emi_plans[${index}][extra_type]`, plan.extra_type);
        formData.append(`emi_plans[${index}][extra_value]`, plan.extra_value);
      });
    }

    if (isEdit) {
      formData.append("_method", "PUT");
    }

    const res = await fetch(url, {
      method,
      headers: {
        // "Content-Type": "multipart/form-data", // Browser sets this automatically with boundary
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await res.json();
    if (!res.ok) {
      let errorMessage = data.message || `Failed to ${isEdit ? "update" : "create"} product.`;
      if (data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        if (firstErrorKey) errorMessage = data.errors[firstErrorKey][0];
      }
      throw new Error(errorMessage);
    }
    return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Product ${variables.isEdit ? "updated" : "created"} successfully!`);
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      console.error("Save Error:", error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  });

  // --- React Query: Mutation for Delete ---
  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete product");
      }
      return id;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      toast.error(error.message || "Error while deleting");
    }
  });

  const handleSaveProduct = (formValues, isEdit = false, productId = null) => {
    saveProductMutation.mutate({ formValues, isEdit, productId });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this! The product will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      deleteProductMutation.mutate(id);
    }
  };

  // --- Modal Function ---
const openProductModal = async (productToEdit = null) => {
  const isEdit = !!productToEdit;

  const initialName = productToEdit?.name || "";
  const initialCategory = productToEdit?.category_id || "";
  const initialType = productToEdit?.product_type || "physical";
  const initialPrice = productToEdit?.price || "";
  const initialDescription = productToEdit?.description || "";
  // --- New Field Initial Value ---
  const initialDownPayment = productToEdit?.down_payment || 0; 
  const initialStockQty = productToEdit?.stock_qty || 0;
  const initialMinStockAlert = productToEdit?.min_stock_alert || 0;
  const initialCCUPercent = productToEdit?.ccu_percentage || 0;
  const initialSupplierId = productToEdit?.supplier_id || "";
  const initialSupplierPercentage = productToEdit?.supplier_percentage || 0;
  const initialSupplierDownPaymentPercentage = productToEdit?.supplier_down_payment_percentage || 0;
  const initialAttributes = productToEdit?.attributes ? JSON.stringify(productToEdit.attributes, null, 2) : "";

  const categoryOptions = categories
    .map((cat) => `<option value="${cat.id}" ${cat.id == initialCategory ? "selected" : ""}>${cat.name}</option>`)
    .join("");
    
  const supplierOptions = suppliers
    .map((supplier) => `<option value="${supplier.id}" ${supplier.id == initialSupplierId ? "selected" : ""}>${supplier.name}</option>`)
    .join("");

  const { value: formValues } = await Swal.fire({
    customClass: {
      popup: "shadow-2xl rounded-xl !max-w-5xl",
      title: "!text-gray-800 !font-extrabold",
    },
    title: `<span class="text-2xl font-bold">${isEdit ? "Edit Product" : "Add New Product"}</span>`,
    width: 1000,
    html: `
      <style>
        .form-field { margin-bottom: 1rem; }
        .form-field label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; text-align: left; }
        .form-field input, .form-field select, .form-field textarea { width: 100%; padding: 0.6rem 0.75rem; font-size: 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
      </style>
      <div class="text-left p-2">
        <div class="form-field">
          <label for="name">Product Name</label>
          <input id="name" value="${initialName}" placeholder="e.g., Duplex Home Model D-4"/>
        </div>
        <div class="grid-2">
          <div class="form-field">
            <label for="category_id">Category</label>
            <select id="category_id" ${categoryLoading ? "disabled" : ""}>
              <option value="" disabled ${!initialCategory ? "selected" : ""}>-- Select Category --</option>
              ${categoryOptions}
            </select>
          </div>
          <div class="form-field">
            <label for="product_type">Product Type</label>
            <select id="product_type">
              <option value="consumer" ${initialType === "consumer" ? "selected" : ""}>Consumer</option>
              <option value="flat" ${initialType === "flat" ? "selected" : ""}>Flat</option>
              <option value="land" ${initialType === "land" ? "selected" : ""}>Land</option>
              <option value="share" ${initialType === "share" ? "selected" : ""}>Share</option>
              <option value="other" ${initialType === "other" ? "selected" : ""}>Other</option>
            </select>
          </div>
        </div>
        <div class="form-field">
            <label for="supplier_id">Supplier</label>
            <select id="supplier_id" ${supplierLoading ? "disabled" : ""}>
              <option value="" ${!initialSupplierId ? "selected" : ""}>-- Select Supplier (Optional) --</option>
              ${supplierOptions}
            </select>
        </div>
        <div class="grid-2">
          <div class="form-field">
            <label for="supplier_percentage">Supplier Installment % (Optional)</label>
            <input id="supplier_percentage" type="number" step="0.01" min="0" max="100" value="${initialSupplierPercentage}" placeholder="0.00" />
          </div>
          <div class="form-field">
            <label for="supplier_down_payment_percentage">Supplier Down Payment % (Optional)</label>
            <input id="supplier_down_payment_percentage" type="number" step="0.01" min="0" max="100" value="${initialSupplierDownPaymentPercentage}" placeholder="0.00" />
          </div>
        </div>
        <div class="grid-2">
          <div class="form-field">
            <label for="price">Price (Tk)</label>
            <input id="price" type="number" step="0.01" value="${initialPrice}" placeholder="0.00" />
          </div>
           <div class="form-field">
            <label for="ccu_percentage">CCU%</label>
            <input id="ccu_percentage" type="number" step="0.01" min="0" max="100" value="${initialCCUPercent}" placeholder="0.00" />
          </div>
        </div>
        
        <div class="grid-2">
          <div class="form-field">
            <label for="down_payment">Down Payment (Tk)</label>
            <input id="down_payment" type="number" step="0.01" value="${initialDownPayment}" placeholder="0.00" />
          </div>
          <div class="form-field">
            <label for="min_stock_alert">Min Stock Alert</label>
            <input id="min_stock_alert" type="number" value="${initialMinStockAlert}" placeholder="5" />
          </div>
        </div>

        <div class="form-field">
          <label for="stock_qty">Stock Quantity</label>
          <input id="stock_qty" type="number" value="${initialStockQty}" placeholder="0" />
        </div>

        <div class="form-field">
          <label for="attributes">Attributes (JSON)</label>
          <textarea id="attributes" rows="3" placeholder='{"plot_size": "5.5 katha"}'>${initialAttributes}</textarea>
        </div>

        <div class="form-field">
          <label>EMI Plans</label>
          <div id="emi-plans-container" class="space-y-3"></div>
          <button type="button" id="add-plan-btn" class="mt-2 bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm border border-blue-200 hover:bg-blue-100 transition">+ Add EMI Plan</button>
        </div>

        <div class="form-field">
          <label for="images">Product Images (Multiple)</label>
          <input id="images" type="file" accept="image/*" multiple />
          <div id="image-preview-container" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px;"></div>
        </div>

        <div class="form-field">
          <label for="image">Main Image (Single)</label>
          <input id="image" type="file" accept="image/*" />
        </div>

        <div class="form-field">
          <label for="description">Description</label>
          <textarea id="description" rows="3" placeholder="Product details...">${initialDescription}</textarea>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: isEdit ? "Update Product" : "Create Product",
    cancelButtonText: "Cancel",
    didOpen: () => {
      const imageInput = document.getElementById("images");
      const previewContainer = document.getElementById("image-preview-container");
      
      // --- EMI Plans Logic ---
      const emiContainer = document.getElementById("emi-plans-container");
      const addPlanBtn = document.getElementById("add-plan-btn");

      const createEl = (tag, classes = []) => {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes);
        return el;
      };

      const addPlanRow = (data = {}) => {
        const row = createEl('div', ['flex', 'gap-3', 'items-end', 'mb-3', 'plan-row', 'bg-gray-50', 'p-3', 'rounded-lg', 'border', 'border-gray-200']);
        
        // Tenure
        const tenureWrapper = createEl('div', ['flex', 'flex-col']);
        const tenureLabel = createEl('label', ['text-xs', 'font-semibold', 'text-gray-500', 'mb-1']);
        tenureLabel.innerText = 'Tenure (Months)';
        const tenureInput = createEl('input', ['w-32', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'text-sm', 'plan-tenure']);
        tenureInput.type = 'number';
        tenureInput.placeholder = 'e.g. 12';
        tenureInput.value = data.tenure_months || '';
        tenureWrapper.append(tenureLabel, tenureInput);

        // Extra Type
        const typeWrapper = createEl('div', ['flex', 'flex-col']);
        const typeLabel = createEl('label', ['text-xs', 'font-semibold', 'text-gray-500', 'mb-1']);
        typeLabel.innerText = 'Extra Type';
        const typeSelect = createEl('select', ['w-32', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'text-sm', 'bg-white', 'plan-type']);
        typeSelect.innerHTML = '<option value="percent">Percent (%)</option><option value="flat">Flat (Tk)</option>';
        typeSelect.value = data.extra_type || 'percent';
        typeWrapper.append(typeLabel, typeSelect);

        // Extra Value
        const valueWrapper = createEl('div', ['flex', 'flex-col', 'flex-1']);
        const valueLabel = createEl('label', ['text-xs', 'font-semibold', 'text-gray-500', 'mb-1']);
        valueLabel.innerText = 'Extra Value';
        const valueInput = createEl('input', ['w-full', 'p-2', 'border', 'border-gray-300', 'rounded-md', 'text-sm', 'plan-value']);
        valueInput.type = 'number';
        valueInput.step = '0.01';
        valueInput.placeholder = '0.00';
        valueInput.value = data.extra_value || '';
        valueWrapper.append(valueLabel, valueInput);

        // Remove
        const removeBtn = createEl('button', ['text-red-500', 'p-2', 'hover:bg-red-100', 'rounded-full', 'transition', 'mb-0.5']);
        removeBtn.type = 'button';
        removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>';
        removeBtn.onclick = () => row.remove();

        row.append(tenureWrapper, typeWrapper, valueWrapper, removeBtn);
        emiContainer.appendChild(row);
      };

      addPlanBtn.onclick = () => addPlanRow();

      // Load existing data
      const existingPlans = productToEdit?.emi_plans || [];
      if (Array.isArray(existingPlans) && existingPlans.length > 0) {
        existingPlans.forEach(p => addPlanRow(p));
      }

      imageInput.addEventListener("change", function () {
        previewContainer.innerHTML = "";
        const files = Array.from(this.files);

        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = function (e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.width = "60px";
            img.style.height = "60px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "5px";
            img.style.border = "1px solid #ccc";
            previewContainer.appendChild(img);
          };
          reader.readAsDataURL(file);
        });
      });
    },
    preConfirm: () => {
      const name = document.getElementById("name").value.trim();
      const category_id = document.getElementById("category_id").value;
      const product_type = document.getElementById("product_type").value;
      const price = document.getElementById("price").value;
      const down_payment = document.getElementById("down_payment").value; // Get value
      const stock_qty = document.getElementById("stock_qty").value;
      const min_stock_alert = document.getElementById("min_stock_alert").value;
      const ccu_percentage = document.getElementById("ccu_percentage").value;
      const supplier_id = document.getElementById("supplier_id").value;
      const supplier_percentage = document.getElementById("supplier_percentage").value;
      const supplier_down_payment_percentage = document.getElementById("supplier_down_payment_percentage").value;
      const description = document.getElementById("description").value;
      const images = document.getElementById("images").files;
      const image = document.getElementById("image").files[0];
      const attributesStr = document.getElementById("attributes").value;

      if (!name || !category_id || !product_type || price === "") {
        Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ All required fields must be filled out!</span>`);
        return false;
      }

      const parsedPrice = parseFloat(price);
      const parsedDownPayment = parseFloat(down_payment) || 0; // Parse Down Payment

      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ Price must be a positive number.</span>`);
        return false;
      }

      if (parsedDownPayment < 0 || parsedDownPayment > parsedPrice) {
        Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ Down payment cannot be negative or exceed the total price.</span>`);
        return false;
      }

      const parsedStockQty = parseInt(stock_qty);
      if (isNaN(parsedStockQty) || parsedStockQty < 0) {
        Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ Stock Quantity must be a non-negative integer.</span>`);
        return false;
      }

      const parsedCCUPercent = parseFloat(ccu_percentage);
      if (isNaN(parsedCCUPercent) || parsedCCUPercent < 0 || parsedCCUPercent > 100) {
        Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ CCU% must be between 0 and 100.</span>`);
        return false;
      }
      
      const parsedSupplierPercentage = parseFloat(supplier_percentage);
      if (supplier_id && (isNaN(parsedSupplierPercentage) || parsedSupplierPercentage < 0 || parsedSupplierPercentage > 100)) {
          Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ Supplier % must be between 0 and 100 if a supplier is selected.</span>`);
          return false;
      }

      const parsedSupplierDownPaymentPercentage = parseFloat(supplier_down_payment_percentage);
      if (supplier_id && (isNaN(parsedSupplierDownPaymentPercentage) || parsedSupplierDownPaymentPercentage < 0 || parsedSupplierDownPaymentPercentage > 100)) {
          Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ Supplier Down Payment % must be between 0 and 100 if a supplier is selected.</span>`);
          return false;
      }

      let parsedAttributes = null;
      if (attributesStr) {
        try {
          parsedAttributes = JSON.parse(attributesStr);
        } catch (e) {
          Swal.showValidationMessage('<span class="text-red-500 font-semibold">⚠️ Invalid JSON in Attributes</span>');
          return false;
        }
      }

      // Scrape EMI Plans from DOM
      const parsedEmiPlans = [];
      const planRows = document.querySelectorAll('.plan-row');
      planRows.forEach(row => {
          const tenure_months = parseInt(row.querySelector('.plan-tenure').value);
          const extra_type = row.querySelector('.plan-type').value;
          const extra_value = parseFloat(row.querySelector('.plan-value').value);

          if (tenure_months && !isNaN(extra_value)) {
              parsedEmiPlans.push({ tenure_months, extra_type, extra_value });
          }
      });

      return {
        name,
        category_id: parseInt(category_id),
        product_type,
        price: parsedPrice,
        down_payment: parsedDownPayment, // Return value
        stock_qty: parsedStockQty,
        min_stock_alert: parseInt(min_stock_alert) || 0,
        ccu_percentage: parsedCCUPercent,
        supplier_id: supplier_id,
        supplier_percentage: supplier_percentage,
        supplier_down_payment_percentage: supplier_down_payment_percentage,
        description,
        images,
        image,
        attributes: parsedAttributes,
        emi_plans: parsedEmiPlans,
      };
    },
  });

  if (formValues) handleSaveProduct(formValues, isEdit, productToEdit?.id);
};

  // --- Filtering ---
  const filteredProducts = products.filter((p) =>
    [p.name, p.id, p.category?.name, p.product_type]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getProductTypeBadge = (type) => {
    switch (type) {
      case "consumer":
        return "bg-indigo-100 text-indigo-800";
      case "flat":
        return "bg-blue-100 text-blue-800";
      case "land":
        return "bg-green-100 text-green-800";
      case "share":
        return "bg-yellow-100 text-yellow-800";
      case "other":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-0 md:p-8">
          <div className="px-2 sm:px-6 lg:px-0 py-8 w-full max-w-full mx-auto">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Title */}
            <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-200">
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                Product Inventory
              </h2>
              <button
                onClick={() => openProductModal(null)}
                className="flex items-center bg-blue-600 text-white font-medium px-4 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition"
              >
                <PlusIcon />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search products by Name, ID, Category, or Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Table */}
            <div className="bg-white p-2 rounded-xl shadow-2xl">
              {loading ? (
                <TableSkeleton />
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xl text-gray-500">
                    {searchTerm
                      ? `No products found matching "${searchTerm}".`
                      : "No products found. Start by adding a new product."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#1976D2] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Type
                        </th>
                        {/* START: NEW HEADERS */}
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Supplier Downpayment %
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Supplier Installment %
                        </th>
                        {/* END: NEW HEADERS */}
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Price
                        </th>
                         <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Down Payment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          EMI Tenure
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          CCU%
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-xl">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredProducts?.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-4 py-4 text-sm font-medium text-gray-800">
                            #{product.id}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {product.category?.name || "-"}
                          </td>
                          <td className="px-4 py-4">
                            {Array.isArray(product.image_url) && product.image_url.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[160px]">
                                {product.image_url.map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`${product.name} ${idx}`}
                                    className="h-10 w-10 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80"
                                    onClick={() => setViewImage(url)}
                                  />
                                ))}
                              </div>
                            ) : product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-10 w-10 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => setViewImage(product.image_url)}
                              />
                            ) : (
                              <span className="text-xs text-gray-400 italic">No Image</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-lg ${getProductTypeBadge(
                                product.product_type
                              )}`}
                            >
                              {product.product_type}
                            </span>
                          </td>
                       
                            <td className="px-4 py-4 text-sm text-gray-600">
                            {product.supplier_down_payment_percentage > 0 ? `${product?.supplier_down_payment_percentage}%` : "-"}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {product.supplier_percentage > 0 ? `${product?.supplier_percentage}%` : "-"}
                          </td>
                          {/* END: NEW DATA CELLS */}
                          <td className="px-4 py-4 text-sm font-bold text-gray-800">
                            {formatToTk(product?.price)}
                          </td>
                             <td className="px-4 py-4 text-sm font-bold text-gray-800">
                            {formatToTk(product?.down_payment)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {product.emi_plans && product.emi_plans.length > 0 
                                ? product.emi_plans.map(r => `${r.tenure_months}M`).join(', ') 
                                : <span className="text-gray-400 italic">N/A</span>}
                          </td>
                          
                          <td className="px-4 py-4 text-sm text-gray-800 font-semibold">
                            {product.ccu_percentage || 0}%
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-800 font-semibold">
                            {product.stock_qty}
                          </td>
                          <td className="px-4 py-4 text-center space-x-3">
                            <button
                              onClick={() => openProductModal(product)}
                              className="inline-flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="inline-flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg"
                            >
                              <DeleteIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Image Preview Modal */}
      {viewImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-full flex justify-center">
            <button
              onClick={() => setViewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={viewImage} 
              alt="Full Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProduct;