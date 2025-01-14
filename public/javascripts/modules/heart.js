import axios from "axios";
import { $ } from "./bling";

function ajaxHeart(e) {
  e.preventDefault();

  axios
    .post(this.action)
    .then((res) => {
      // this gives the form and every `name` property is accessible there
      const isHearted = this.heart.classList.toggle("heart__button--hearted");

      // Update counter in the header
      $(".heart-count").textContent = res.data.hearts.length;

      if (isHearted) {
        this.heart.classList.add("heart__button--float");
        setTimeout(
          () => this.heart.classList.remove("heart__button--float"),
          2500
        );
      }
    })
    .catch((err) => console.log(err));
}

export default ajaxHeart;
