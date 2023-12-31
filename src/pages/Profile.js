import HomeNav from "../components/HomeNav";
import Footer from "../components/Footer";
import EditProfileModal from "../components/EditModalInfo";
import "../styles/Profile.scss";
import { useState, useEffect } from "react";
import { BiUser } from "react-icons/bi";

export default function Profile() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    mobileNum: "",
    address: "",
  });

  useEffect(() => {
    const accountId = window.localStorage.getItem("accountId");

    const fetchUserDetails = async () => {
      try {
        if (accountId) {
          const url = `http://localhost/serverside/auth/userDetails.php?account_id=${accountId}`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.success) {
            const { firstName, lastName, mobileNum, address } = data.user;
            setUserInfo({ firstName, lastName, mobileNum, address });
          } else {
            console.error("Failed to fetch user details");
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
    fetchUserOrders(accountId);
  }, []);

    const fetchUserOrders = async (accountId) => {
      try {
        if (accountId) {
          const url = `http://localhost/serverside/orders/getUserOrders.php?account_id=${accountId}`;
          const res = await fetch(url);
          const data = await res.json();
  
          if (data.length > 0) {
            setOrderDetails(data);
          } else {
            console.log("No orders found for the user");
          }
        }
      } catch (error) {
        console.error("Error fetching user orders:", error);
      }
    };

  const handleCancelOrder = async (invoiceNum) => {
    const confirmation = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmation) {
      return;
    }

    try {
      const response = await fetch('http://localhost/serverside/orders/cancelOrder.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNum: invoiceNum,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Order canceled successfully');
        window.location.href = '/Profile';
        fetchUserOrders();
      } else {
        console.error('Failed to cancel order:', data.error);
      }
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  const handleRemoveItem = async (invoiceNum) => {
    const confirmation = window.confirm("Are you sure you want to remove this item? It also cancels the order when you remove the item. Proceed?");
    if (!confirmation) {
      return;
    }

    try {
      const response = await fetch('http://localhost/serverside/orders/removeOrder.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNum: invoiceNum,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Item removed successfully');
        window.location.href = '/Profile';
        fetchUserOrders();
      } else {
        console.error('Failed to remove item:', data.error);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const groupOrdersIntoRows = (orders) => {
    const result = [];
    let currentRow = [];

    orders.forEach((order, index) => {
      currentRow.push(order);

      if (currentRow.length === 3 || index === orders.length - 1) {
        result.push([...currentRow]);
        currentRow = [];
      }
    });

    return result;
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
    setModalIsOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsEditMode(false);
    setModalIsOpen(false);

    try {
      const response = await fetch('http://localhost/serverside/auth/updateProfileInfo.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: window.localStorage.getItem("accountId"),
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          mobileNum: userInfo.mobileNum,
          address: userInfo.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('User details updated successfully');
        alert("Profile Details Saved!")
        window.location.href = '/Profile';
      } else {
        console.error('Failed to update user details:', data.error);
      }
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  useEffect(() => {
    document.title = "Profile | Ate Gang's Catering Services";
  
    return () => {
      document.title = "Ate Gang's Catering Services";
    };
  }, []);

  return (
    <>
      <HomeNav />

      <section className="profile-body">
        <div className="profile-container">
          <div className="profile-text">
            <BiUser className="profile-user-icon" />
            <h1>Profile</h1>
            <button
              className={isEditMode ? "save-profile" : "edit-profile"}
              onClick={isEditMode ? handleSaveProfile : handleEditProfile}
            >
              {isEditMode ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
          <div className="profile-info">
            <h1>{`${userInfo.firstName} ${userInfo.lastName}`}</h1>
            <h2>
              Current Location: <span>{userInfo.address}</span>
            </h2>
            <h2>
              Mobile Number: <span>{userInfo.mobileNum}</span>
            </h2>
          </div>
          <div className="profile-box-ctn">
            {groupOrdersIntoRows(orderDetails).map((row, rowIndex) => (
              <div className="profile-info-row" key={rowIndex}>
                {row.map((order, index) => (
                  <div className={`profile-info-box ${order.isOrderDone ? 'order-done' : ''}`} key={index}>
                    <h1>
                      Invoice Number: <span>{order.invoiceNum}</span>
                    </h1>
                    <h1>
                      Ordered Item:{" "}
                      <span>
                        {order.items && Array.isArray(order.items)
                          ? order.items
                              .map(
                                (item) => `${item.quantity} x ${item.itemName}`
                              )
                              .join(", ")
                          : "No items"}
                      </span>
                    </h1>
                    <h1>   
                      Date Issued: <span>{order.addDate}</span>
                    </h1>
                    <h1>
                      Total Bill: <span>{order.totalbill} PHP</span>
                    </h1>
                    <h1>
                      Special Note: <span>{order.note || "N/A"}</span>
                    </h1>
                    <h2>
                  Status:{" "}
                  <span
                    className={
                      order.status === "Not yet Delivered"
                        ? "status-not-delivered"
                        : "status-delivered"
                    }
                  >
                    {order.status}
                  </span>
                </h2>

                    <div className="profile-line-btn">
                    <p onClick={() => handleCancelOrder(order.invoiceNum)}>Cancel Order</p>
                    <p onClick={() => handleRemoveItem(order.invoiceNum)}>Remove Item</p>
                    </div>
                  </div>
                ))}
              </div>
              
            ))}
            
          </div>
        </div>
        
      </section>
      <EditProfileModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        onSave={handleSaveProfile}
        userData={userInfo}
        setUserData={setUserInfo}
      />
      <Footer />
    </>
  );
}
