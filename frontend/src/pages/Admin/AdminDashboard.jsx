import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("stats");

  // Data States
  const [orders, setOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form State for New Item
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });
  const [imageFile, setImageFile] = useState(null);

  // Form State for New Category
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [categoryImageFile, setCategoryImageFile] = useState(null);

  // Delivery State
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [newDeliveryMan, setNewDeliveryMan] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Initial Fetch
  const navigate = useNavigate();

  // Initial Fetch
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        fetchCategories();
        fetchDashboardStats();
      } else {
        navigate("/menu"); // Redirect non-admins
      }
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      // If admin, get all. If Chief, get all (or kitchen specific)
      const res = await apiClient.get("/orders/all");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders");
    }
  };

  // Fetch dashboard statistics for admin sales report
  const fetchDashboardStats = async () => {
    try {
      const res = await apiClient.get("/reports/dashboard");
      setDashboardStats(res.data);
    } catch (err) {
      console.error("Error fetching dashboard stats", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories");
    }
  };

  const fetchDeliveryMen = async () => {
    try {
      const res = await apiClient.get("/delivery");
      setDeliveryMen(res.data);
    } catch (err) {
      console.error("Error fetching delivery men");
    }
  };

  // --- HANDLE ADD MENU ITEM ---
  const handleAddItem = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (!imageFile) return alert("Please upload an image");
    if (!newItem.categoryId) return alert("Please select a category");

    // 2. Prepare FormData (Required for Images)
    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("description", newItem.description);
    formData.append("price", newItem.price);
    formData.append("categoryId", newItem.categoryId);
    formData.append("image", imageFile); // 'image' must match backend middleware

    try {
      // 3. Send Request
      await apiClient.post("/menu", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Menu Item Added Successfully!");

      // 4. Reset Form
      setNewItem({ name: "", description: "", price: "", categoryId: "" });
      setImageFile(null);

      // Optional: You could allow file input reset here via a ref
    } catch (error) {
      console.error(error);
      alert("❌ Failed to add item. Check console.");
    }
  };

  // --- HANDLE ADD CATEGORY ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryImageFile) return alert("Please upload a category image");

    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("image", categoryImageFile);

    try {
      await apiClient.post("/categories/add-category", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Category Added Successfully!");
      setNewCategory({ name: "" });
      setCategoryImageFile(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add category.");
    }
  };

  // --- HANDLE STATUS CHANGE ---
  // --- HANDLE STATUS CHANGE ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (newStatus === "onTheWay") {
        // Trigger automatic assignment
        await apiClient.post(`/delivery/assign/${orderId}`);
        alert("Delivery Man Assigned automatically!");
      } else {
        await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      }

      // Refresh orders to see updates
      fetchOrders();
      fetchDeliveryMen();
    } catch (error) {
      console.error("Failed to update status", error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  // --- HANDLE DOWNLOAD PDF ---
  const handleDownloadPDF = async () => {
    try {
      const response = await apiClient.get('/reports/export-pdf', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'dashboard_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF", error);
      alert("Failed to download PDF report");
    }
  };

  // --- HANDLE ADD DELIVERY MAN ---
  const handleAddDeliveryMan = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (newDeliveryMan.password !== newDeliveryMan.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await apiClient.post("/delivery/add", newDeliveryMan);
      alert("Delivery Man Added!");
      setNewDeliveryMan({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
      fetchDeliveryMen();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to add delivery man");
    }
  };

  // Helper: Only Admin can see Stats and Menu Mgmt
  const isAdmin = user?.role === "admin";

  return (
    <div className="admin-container">
      <h1>Dashboard: {user?.firstName}</h1>

      {/* TABS (Only for Admin) */}
      {isAdmin && (
        <div className="admin-tabs">
          <button
            className={activeTab === "stats" ? "active" : ""}
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </button>
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={activeTab === "menu" ? "active" : ""}
            onClick={() => setActiveTab("menu")}
          >
            Add Menu Item
          </button>
          <button onClick={() => setActiveTab("categories")}>Categories</button>
          <button
            className={activeTab === "delivery" ? "active" : ""}
            onClick={() => {
              setActiveTab("delivery");
              fetchDeliveryMen();
            }}
          >
            Delivery
          </button>
        </div>
      )}

      {/* --- TAB 1: ORDERS --- */}
      {activeTab === "orders" && (
        <div className="orders-view">
          <h2>Recent Orders</h2>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o._id.substring(0, 6)}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) =>
                        handleStatusChange(o._id, e.target.value)
                      }
                      className={`status-select ${o.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="onTheWay">On The Way</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>${o.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 2: MENU MANAGEMENT (The part you asked for) --- */}
      {activeTab === "stats" && isAdmin && (
        <div className="stats-grid">
          {dashboardStats && (
            <>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <button
                  onClick={handleDownloadPDF}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--secondary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  <span>📄</span> Download PDF Report
                </button>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">💰</div>
                <h3>Total Revenue</h3>
                <p>${dashboardStats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon">📦</div>
                <h3>Total Orders</h3>
                <p>{dashboardStats.totalOrders}</p>
              </div>
              <div className="stat-card warning">
                <div className="stat-card-icon">⏳</div>
                <h3>Pending Orders</h3>
                <p>{dashboardStats.pendingOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Daily Stats</h3>
                <table className="orders-table">
                  <thead>
                    <tr><th>Date</th><th>Revenue</th><th>Orders</th></tr>
                  </thead>
                  <tbody>
                    {dashboardStats.dailyStats.map((d, i) => (
                      <tr key={i}>
                        <td>{d._id}</td>
                        <td>${d.dailyRevenue.toFixed(2)}</td>
                        <td>{d.orderCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="stat-card" style={{ gridColumn: "span 2", alignItems: "stretch", textAlign: "left" }}>
                <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Top Selling Items</h3>
                <ul className="top-selling-list">
                  {dashboardStats.topSellingItems?.map((item, index) => (
                    <li key={index} className="top-selling-item">
                      <span className="item-rank">#{index + 1}</span>
                      <span className="item-name">{item._id}</span>
                      <span className="item-sold">{item.totalSold} sold</span>
                    </li>
                  ))}
                  {(!dashboardStats.topSellingItems || dashboardStats.topSellingItems.length === 0) && (
                    <li style={{ padding: '10px 0', color: '#888', textAlign: 'center' }}>No sales data yet.</li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
      {activeTab === "menu" && isAdmin && (
        <div className="menu-management">
          <div className="form-card">
            <h2>Add New Dish</h2>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Dish Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="e.g. Pepperoni Pizza"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Ingredients and details..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newItem.categoryId}
                    onChange={(e) =>
                      setNewItem({ ...newItem, categoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <small style={{ color: "red" }}>
                      No categories found! Add them in DB first.
                    </small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Add to Menu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 3: CATEGORIES --- */}
      {activeTab === "categories" && isAdmin && (
        <div className="menu-management">
          <div className="form-card">
            <h2>Add New Category</h2>
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="e.g. Pizza, Drinks"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCategoryImageFile(e.target.files[0])}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Add Category
              </button>
            </form>
          </div>

          <div className="orders-view" style={{ marginTop: "30px" }}>
            <h2>Existing Categories</h2>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>{cat.name}</td>
                    <td>
                      {cat.image ? (
                        <img
                          src={`http://localhost:5000/uploads/${cat.image}`}
                          alt={cat.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: DELIVERY --- */}
      {activeTab === "delivery" && isAdmin && (
        <div className="menu-management">
          <div className="form-card">
            <h2>Add Delivery Man</h2>
            <form onSubmit={handleAddDeliveryMan}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newDeliveryMan.name}
                  onChange={(e) =>
                    setNewDeliveryMan({
                      ...newDeliveryMan,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={newDeliveryMan.phone}
                  onChange={(e) =>
                    setNewDeliveryMan({
                      ...newDeliveryMan,
                      phone: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newDeliveryMan.email}
                  onChange={(e) =>
                    setNewDeliveryMan({
                      ...newDeliveryMan,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newDeliveryMan.password}
                  onChange={(e) =>
                    setNewDeliveryMan({
                      ...newDeliveryMan,
                      password: e.target.value,
                    })
                  }
                  minLength="6"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={newDeliveryMan.confirmPassword}
                  onChange={(e) =>
                    setNewDeliveryMan({
                      ...newDeliveryMan,
                      confirmPassword: e.target.value,
                    })
                  }
                  minLength="6"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                Add Delivery Man
              </button>
            </form>
          </div>

          <div className="orders-view" style={{ marginTop: "30px" }}>
            <h2>Delivery Personnel</h2>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveryMen.map((man) => (
                  <tr key={man._id}>
                    <td>{man.name}</td>
                    <td>{man.phone}</td>
                    <td>
                      <span
                        style={{
                          color: man.status === "available" ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {man.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
