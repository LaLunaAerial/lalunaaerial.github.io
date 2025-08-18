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

  const handleEdit = (userId, packageType, field, value) => {
    setEditedPackages((prevEditedPackages) => ({
      ...prevEditedPackages,
      [userId]: {
        ...prevEditedPackages[userId],
        [packageType]: { ...prevEditedPackages[userId][packageType], [field]: value },
      },
    }));
  };

  const handleSubmitEdit = (userId, packageType) => {
    const packageRef = ref(db, `userPackages/${userId}/${packageType}`);
    update(packageRef, editedPackages[userId][packageType]).then(() => {
      alert('Package updated successfully!');
      const userPackagesRef = ref(db, 'userPackages');
      get(userPackagesRef).then((snapshot) => {
        setUserPackages(snapshot.val());
        setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
      });
    });
  };

  const handleApprove = (userId, packageType) => {
    const packageRef = ref(db, `userPackages/${userId}/${packageType}`);
    update(packageRef, { status: 'approved' }).then(() => {
      alert('Package approved!');
      const userPackagesRef = ref(db, 'userPackages');
      get(userPackagesRef).then((snapshot) => {
        setUserPackages(snapshot.val());
        setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
      });
    });
  };

  const handleReject = (userId, packageType) => {
    const packageRef = ref(db, `userPackages/${userId}/${packageType}`);
    update(packageRef, { status: 'rejected' }).then(() => {
      alert('Package rejected!');
      const userPackagesRef = ref(db, 'userPackages');
      get(userPackagesRef).then((snapshot) => {
        setUserPackages(snapshot.val());
        setEditedPackages(JSON.parse(JSON.stringify(snapshot.val())));
      });
    });
  };

  const handleDeletePackage = (userId, packageType) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      const packageRef = ref(db, `userPackages/${userId}/${packageType}`);
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

  return (
    <div className="view-all-packages-page">
      <h2>All User Packages</h2>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Package Type</th>
            <th>Package Name</th>
            <th>Number of Sections</th>
            <th>Expiry Date</th>
            <th>Remaining Quota</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(userPackages).map((userId) => (
            <React.Fragment key={userId}>
              {Object.keys(userPackages[userId]).map((packageType) => (
                <tr key={packageType}>
                  <td>{userId}</td>
                  <td>{packageType}</td>
                  <td>
                    <p>{userPackages[userId][packageType].packageName}</p>
                    <input
                      type="text"
                      value={editedPackages[userId]?.[packageType]?.packageName || ''}
                      onChange={(e) => handleEdit(userId, packageType, 'packageName', e.target.value)}
                      placeholder="Enter new value"
                    />
                  </td>
                  <td>
                    <p>{userPackages[userId][packageType].numberOfSections}</p>
                    <input
                      type="number"
                      value={editedPackages[userId]?.[packageType]?.numberOfSections || ''}
                      onChange={(e) => handleEdit(userId, packageType, 'numberOfSections', e.target.value)}
                      placeholder="Enter new value"
                    />
                  </td>
                  <td>
                    <p>{userPackages[userId][packageType].expiryDate}</p>
                    <input
                      type="date"
                      value={editedPackages[userId]?.[packageType]?.expiryDate || ''}
                      onChange={(e) => handleEdit(userId, packageType, 'expiryDate', e.target.value)}
                      placeholder="Enter new value"
                    />
                  </td>
                  <td>
                    <p>{userPackages[userId][packageType].remainingQuota}</p>
                    <input
                      type="number"
                      value={editedPackages[userId]?.[packageType]?.remainingQuota || ''}
                      onChange={(e) => handleEdit(userId, packageType, 'remainingQuota', e.target.value)}
                      placeholder="Enter new value"
                    />
                  </td>
                  <td>
                    <p>{userPackages[userId][packageType].status}</p>
                    <input
                      type="text"
                      value={editedPackages[userId]?.[packageType]?.status || ''}
                      onChange={(e) => handleEdit(userId, packageType, 'status', e.target.value)}
                      placeholder="Enter new value"
                    />
                  </td>
                  <td>
                    {userPackages[userId][packageType].status === 'pending' ? (
                      <div>
                        <button onClick={() => handleApprove(userId, packageType)}>Approve</button>
                        <button onClick={() => handleReject(userId, packageType)}>Reject</button>
                      </div>
                    ) : (
                        <div>
                            <button onClick={() => handleSubmitEdit(userId, packageType)}>Submit Edit</button>
                            <button onClick={() => handleDeletePackage(userId, packageType)}>Delete</button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewAllPackagesPage;