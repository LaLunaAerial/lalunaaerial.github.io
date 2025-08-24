// ViewAllPackagesPage.jsx
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update,remove } from 'firebase/database';
import './ViewAllPackagesPage.css';

const ViewAllPackagesPage = () => {
  const [userPackages, setUserPackages] = useState({});
  const [editedPackages, setEditedPackages] = useState({});
  const db = getDatabase();

  useEffect(() => {
    const userPackagesRef = ref(db, 'userPackages');
    get(userPackagesRef).then((snapshot) => {
      setUserPackages(snapshot.val());
      setEditedPackages(JSON.parse(JSON.stringify(snapshot.val()))); // Initialize editedPackages state with a copy of userPackages
    });
  }, []);

  const handleEdit = (userName, packageType, field, value) => {
    setEditedPackages((prevEditedPackages) => ({
      ...prevEditedPackages,
      [userName]: {
        ...prevEditedPackages[userName],
        [packageType]: { ...prevEditedPackages[userName][packageType], [field]: value },
      },
    }));
  };

  const handleSubmitEdit = (userName, packageType) => {
    const packageRef = ref(db, `userPackages/${userName}/${packageType}`);
    update(packageRef, editedPackages[userName][packageType]).then(() => {
      alert('Package updated successfully!');
      const userPackagesRef = ref(db, 'userPackages');
      get(userPackagesRef).then((snapshot) => {
        setUserPackages(snapshot.val());
        setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
      });
    });
  };

  const handleApprove = (userName, packageType) => {
    const packageRef = ref(db, `userPackages/${userName}/${packageType}`);
    update(packageRef, { status: 'approved' }).then(() => {
      alert('Package approved!');
      const userPackagesRef = ref(db, 'userPackages');
      get(userPackagesRef).then((snapshot) => {
        setUserPackages(snapshot.val());
        setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
      });
    });
  };

  const handleReject = (userName, packageType) => {
    const packageRef = ref(db, `userPackages/${userName}/${packageType}`);
    update(packageRef, { status: 'rejected' }).then(() => {
      alert('Package rejected!');
      const userPackagesRef = ref(db, 'userPackages');
      get(userPackagesRef).then((snapshot) => {
        setUserPackages(snapshot.val());
        setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
      });
    });
  };

  const handleDeletePackage = (userName, packageType) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      const packageRef = ref(db, `userPackages/${userName}/${packageType}`);
      remove(packageRef).then(() => {
        alert('Package deleted successfully!');
        const userPackagesRef = ref(db, 'userPackages');
        get(userPackagesRef).then((snapshot) => {
          setUserPackages(snapshot.val());
          setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
        });
      });
    }
  };

  const handleShowCapscreen = (userName, packageType) => {
  const paymentScreenshotUrl = userPackages[userName][packageType].paymentScreenshot;
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
          <th>User Name</th>
          <th>Package Type</th>
          <th>Package Name</th>
          <th>Number of Sections</th>
          <th>Expiry Date</th>
          <th>Remaining Quota</th>
          <th>Status</th>
          <th>Actions</th>
          <th>Payment Screenshot</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(userPackages).map((userName) => (
          <React.Fragment key={userName}>
            {Object.keys(userPackages[userName]).map((packageType) => (
              <tr key={packageType}>
                <td>{userName}</td>
                <td>{packageType}</td>
                <td>
                  <p>{userPackages[userName][packageType].packageName}</p>
                  <input
                    type="text"
                    value={editedPackages[userName]?.[packageType]?.packageName || ''}
                    onChange={(e) => handleEdit(userName, packageType, 'packageName', e.target.value)}
                    placeholder="Enter new value"
                  />
                </td>
                <td>
                  <p>{userPackages[userName][packageType].numberOfSections}</p>
                  <input
                    type="number"
                    value={editedPackages[userName]?.[packageType]?.numberOfSections || ''}
                    onChange={(e) => handleEdit(userName, packageType, 'numberOfSections', e.target.value)}
                    placeholder="Enter new value"
                  />
                </td>
                <td>
                  <p>{userPackages[userName][packageType].expiryDate}</p>
                  <input
                    type="date"
                    value={editedPackages[userName]?.[packageType]?.expiryDate || ''}
                    onChange={(e) => handleEdit(userName, packageType, 'expiryDate', e.target.value)}
                    placeholder="Enter new value"
                  />
                </td>
                <td>
                  <p>{userPackages[userName][packageType].remainingQuota}</p>
                  <input
                    type="number"
                    value={editedPackages[userName]?.[packageType]?.remainingQuota || ''}
                    onChange={(e) => handleEdit(userName, packageType, 'remainingQuota', e.target.value)}
                    placeholder="Enter new value"
                  />
                </td>
                <td>
                  <p>{userPackages[userName][packageType].status}</p>
                  <select
                    value={editedPackages[userName]?.[packageType]?.status || ''}
                    onChange={(e) => handleEdit(userName, packageType, 'status', e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>
                  
                  
                  
                  {
                    userPackages[userName] && userPackages[userName][packageType] && userPackages[userName][packageType].status === 'approved' ? (
                      <button onClick={() => handleSubmitEdit(userName, packageType)}>Submit Edit</button>
                    ) : (
                      <div>
                        <button onClick={() => handleApprove(userName, packageType)}>Approve</button>
                        <button onClick={() => handleReject(userName, packageType)}>Reject</button>
                      </div>
                    )
                  }
                  <button onClick={() => handleDeletePackage(userName, packageType)}>Delete</button>
                </td>
                <td>
                  {userPackages[userName][packageType].paymentScreenshot && (
                    <button onClick={() => handleShowCapscreen(userName, packageType)}>Show CapScreen</button>
                  )}
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
    </div>
    ):(
      <p>No any packages found in the database.</p>
    )}
    {/* Modal to display the payment screenshot */}
    <div id="capscreen-modal" style={{ display: 'none', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', border: '1px solid black' }}>
      <img id="capscreen-image" src="" alt="Payment Screenshot" style={{ width: '100%', height: '100%' }} />
      <p id="capscreen-loading-text" style={{ display: 'none' }}>Loading...</p>
      <button onClick={() => document.getElementById('capscreen-modal').style.display = 'none'}>Close</button>
    </div>
  </div>
);
};

export default ViewAllPackagesPage;