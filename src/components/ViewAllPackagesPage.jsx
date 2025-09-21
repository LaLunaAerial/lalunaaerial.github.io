// ViewAllPackagesPage.jsx
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update,remove } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject,uploadBytes, getDownloadURL } from 'firebase/storage';
import './ViewAllPackagesPage.css';

const ViewAllPackagesPage = () => {
  const [userPackages, setUserPackages] = useState({});
  const [editedPackages, setEditedPackages] = useState({});
  const db = getDatabase();

  useEffect(() => {
    const userPackagesRef = ref(db, 'userPackages');
    get(userPackagesRef).then((snapshot) => {
      const packages = snapshot.val();
      const formattedPackages = {};
      for (const username in packages) {
        for (const packageType in packages[username]) {
          for (const purchaseDate in packages[username][packageType]) {
            const packageData = packages[username][packageType][purchaseDate];
            if (!formattedPackages[username]) {
              formattedPackages[username] = {};
            }
            if (!formattedPackages[username][packageType]) {
              formattedPackages[username][packageType] = {};
            }
            formattedPackages[username][packageType][purchaseDate] = packageData;
          }
        }
      }
      setUserPackages(formattedPackages);
      setEditedPackages(JSON.parse(JSON.stringify(formattedPackages)));
    });

    // debug log
    console.log("User Packages Data: ", userPackages);
  }, []);

const handleEdit = (userName, packageType, purchaseDate, field, value) => {
  setEditedPackages((prevEditedPackages) => ({
      ...prevEditedPackages,
      [userName]: {
        ...prevEditedPackages[userName],
        [packageType]: {
          ...prevEditedPackages[userName][packageType],
          [purchaseDate]: {
            ...prevEditedPackages[userName][packageType][purchaseDate],
            [field]: value,
          },
        },
      },
  }));
};

  const handleSubmitEdit = (userName, packageType, purchaseDate) => {
    const packageRef = ref(db, `userPackages/${userName}/${packageType}/${purchaseDate}`);
    update(packageRef, editedPackages[userName][packageType][purchaseDate]).then(() => {
      alert('Package information updated successfully!');
      const userPackagesRef = ref(db, 'userPackages');
      get(userPackagesRef).then((snapshot) => {
        setUserPackages(snapshot.val());
        setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
      });
    });
  };

  const handleApprove = (userName, packageType, purchaseDate) => {
    const packageRef = ref(db, `userPackages/${userName}/${packageType}/${purchaseDate}`);
    update(packageRef, { status: 'approved' }).then(() => {
      alert('Package approved!');
      const userPackagesRef = ref(db, 'userPackages');
      get(userPackagesRef).then((snapshot) => {
        setUserPackages(snapshot.val());
        setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
      });
    });
  };

  const handleReject = (userName, packageType, purchaseDate) => {
    const packageRef = ref(db, `userPackages/${userName}/${packageType}/${purchaseDate}`);
    update(packageRef, { status: 'rejected' }).then(() => {
      alert('Package rejected!');
      const userPackagesRef = ref(db, 'userPackages');
      get(userPackagesRef).then((snapshot) => {
        setUserPackages(snapshot.val());
        setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
      });
    });
  };

  const handleDeletePackage = (userName, packageType, purchaseDate) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      const packageRef = ref(db, `userPackages/${userName}/${packageType}/${purchaseDate}`);
      remove(packageRef).then(() => {
        alert('Package deleted successfully!');
  
        // Delete the payment screenshot from storage
        const paymentScreenshot = userPackages[userName][packageType][purchaseDate].paymentScreenshot;
        const filePath = paymentScreenshot.substring(paymentScreenshot.lastIndexOf("%2F") + 3, paymentScreenshot.indexOf("?alt"));
        console.log("File Path to delete:", filePath);
        const storage = getStorage();
        const paymentScreenshotRef = storageRef(storage, `payme-screenshots/${filePath}`);
        deleteObject(paymentScreenshotRef).then(() => {
          alert('Payment screenshot deleted successfully');
        }).catch((error) => {
          alert('Error deleting payment screenshot:', error);
        });
  
        const userPackagesRef = ref(db, 'userPackages');
        get(userPackagesRef).then((snapshot) => {
          setUserPackages(snapshot.val());
          setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
        });
      });
    }
  };

  const handleShowCapscreen = (userName, packageType, purchaseDate) => {
  const paymentScreenshotUrl = userPackages[userName][packageType][purchaseDate].paymentScreenshot;
  if (paymentScreenshotUrl) {
    // Create a modal to display the payment screenshot
    const modal = document.getElementById('capscreen-modal');
    modal.style.display = 'block';
    const image = document.getElementById('capscreen-image');
    const loadingText = document.getElementById('capscreen-loading-text');
    loadingText.style.display = 'block';
    image.src = paymentScreenshotUrl;
    image.onload = () => {
        loadingText.style.display = 'none';
      };
    const imagePath = paymentScreenshotUrl.substring(paymentScreenshotUrl.lastIndexOf("%2F") + 3, paymentScreenshotUrl.indexOf("?alt"));
    const imagePathElement = document.getElementById('capscreen-image-path');
    imagePathElement.textContent = imagePath;
    console.log("Image Path: ", imagePath);
    }
  };

return (
  <div className="view-all-packages-page">
    <h2>All User Packages</h2>
    {userPackages?(
      <div className="view-all-packages-table">
      <table>
        <thead>
          <tr>
            <th>Package Name</th>
            <th>Package Type</th>
            <th>Purchase Date</th>
            <th>Payment Screenshot</th>
            <th>Price</th>
            <th>Number of Sections</th>
            <th>Effective Period</th>
            <th>Remaining Quota</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(userPackages).map(([username, packages]) => (
            Object.entries(packages).map(([packageType, packageData]) => (
              Object.entries(packageData).map(([purchaseDate, packageRecord]) => (
                <tr key={purchaseDate}>
                  <td>{packageRecord.packageName}</td>
                  <td>{packageRecord.packageType}</td>
                  <td>{packageRecord.purchaseDate}</td>
                  <td>
                    <button onClick={() => handleShowCapscreen(username, packageType, purchaseDate)}>Show Capscreen</button>
                  </td>
                  <td>{packageRecord.price}</td>
                  <td>{packageRecord.numberOfSections}</td>
                  <td>
                    <p>{packageRecord.expiryDate}</p>
                    <input
                      type="date"
                      value={editedPackages[username]?.[packageType]?.[purchaseDate]?.expiryDate || ''}
                      onChange={(e) => handleEdit(username, packageType,purchaseDate, 'expiryDate', e.target.value)}
                      placeholder="Enter new value"
                    />
                  </td>
                  <td><p>{packageRecord.remainingQuota}</p>
                    <input
                    type="number"
                    value={editedPackages[username]?.[packageType]?.[purchaseDate]?.remainingQuota || ''}
                    onChange={(e) => handleEdit(username, packageType,purchaseDate, 'remainingQuota', e.target.value)}
                    placeholder="Enter new value"
                  />
                  </td>
                  <td>{packageRecord.status}</td>
                  <td>
                    {packageRecord.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(username, packageType, purchaseDate)}>Approve</button>
                        <button onClick={() => handleReject(username, packageType, purchaseDate)}>Reject</button>
                      </>
                    )}
                    {packageRecord.status === 'approved' && (
                      <>
                        <button onClick={() => handleSubmitEdit(username, packageType, purchaseDate)}>Submit Edit</button>
                        <button onClick={() => handleDeletePackage(username, packageType, purchaseDate)}>Delete</button>
                      </>
                    )}
                    
                  </td>
                </tr>
              ))
            ))
          ))}
        </tbody>
      </table>
    </div>
    ):(
      <p>No any packages found in the database.</p>
    )}
    {/* Modal to display the payment screenshot */}
    <div id="capscreen-modal" style={{ display: 'none', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', border: '1px solid black' }}>
      <p>Payment Screenshot Path: <span id="capscreen-image-path"></span></p>
      <img id="capscreen-image" src="" alt="Payment Screenshot" style={{ width: '100%', height: '100%' }} />
      <p id="capscreen-loading-text" style={{ display: 'none' }}>Loading...</p>
      <button onClick={() => document.getElementById('capscreen-modal').style.display = 'none'}>Close</button>
    </div>
  </div>
);
};

export default ViewAllPackagesPage;