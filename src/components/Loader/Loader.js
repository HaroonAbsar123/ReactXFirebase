import React from "react";
import classes from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={classes.spinner}>
      <div class={classes.spinnerCenter}>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
        <div class={classes.spinnerBlade}></div>
      </div>
    </div>
  );
}
