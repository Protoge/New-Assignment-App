const arr = document.querySelector(".arr");

arr.addEventListener("click", function() {
  const form = document.querySelector(".main-form");
  form.classList.toggle("appear");
  arr.classList.toggle("up");
});
