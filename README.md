requirements:

raw requirement:
或者佢會收到個系統自動send俾佢嘅email去confirm ？

Remainning Task:
1. fixing the calculation of Peak/Non-Peak in the ViewAllBookingPage.jsx handleApprove()
2. do notifiation

Changed:
1. Now will use phone number to do Authentication. email:{phone number}+@phone.com
2. Now created user.displayName for the Name input on Registeration, will display into the navBar.



Fast Key:
I am doing a room booking website using React. Now please scan the code in the project directory to familiar yourself with the project.



Now, the in ShoppingCart.jsx, handleBuyPackage will create the record acording to the packageItem.name, and will check if the same package has been bought by the user. It will not allow the user to buy the package.

However, now i want to change the logic. For now, I would like to allow the user to buy the same package more than once, and when the user buy the package, it will increase the remainning quota of the corresponding userPackage. Please adjust the logic in the ShoppingCart.jsx and ViewAllPackage.jsx so that they could fulfill this requirement.