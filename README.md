requirements:

raw requirement:
會唔會整到個function係可以user 俾咗錢之後我哋Approved
佢喺網站睇返confirm Booking嘅資料 eg 地址 密碼鎖pw
或者佢會收到個系統自動send俾佢嘅email去confirm ？

Remainning Task:
1. upload Payme Capscreen呢個係做到嘅
2. shopping cart可以俾user揀用套票定直接俾錢
3. (User Page可以喺一個鐘前show 密碼鎖密碼)
4. Modify the website design layout the fit the mobile phone user. (use collapse menu to replace navBar)

Changed:
1. Now will use phone number to do Authentication. email:{phone number}+@phone.com
2. Now created user.displayName for the Name input on Registeration, will display into the navBar.



Fast Key:
I am doing a room booking webiste using React. Now please scan the code in the project directory to familiar yourself with the project.

Now the PackageBuyPage.jsx, there is a button that will trigger handleBuyPackage(packageId), that will directly submit a buy package request. 
Now I want to modify the Buy Packages buttons into ShoppingCart.jsx. And also please modfify the button action to be: "Add the selected package into a table", and when the user click a submit button, then execute the handleBuyPackage(packageId) to submit the buy package request.