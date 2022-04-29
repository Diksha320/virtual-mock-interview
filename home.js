var nameInput = document.querySelector("input#name");
var emailInput = document.querySelector("input#email");
var loginButton = document.querySelector("button#login");

loginButton.addEventListener("click", () => {
  var name = nameInput.value;
  var email = emailInput.value;

  var loginData = new FormData();
  loginData.append("name", name);
  loginData.append("email", email);

  fetch("http://localhost:5000/login-user", {
    method: "POST",
    body: loginData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("data", data);
      window.location.href = "course.html";
    })
    .catch((err) => console.log("Error: ", err));
});
