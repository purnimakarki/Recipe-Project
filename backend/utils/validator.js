function isEmail(email) {
  const emailPattern =
    /^([a-zA-Z][\w\.\-]+[a-zA-Z0-9])@([a-zA-Z0-9]+)\.([a-zA-Z]{2,5})(\.[a-zA-Z]{2,4})?$/;
  return emailPattern.test(email);
}

export { isEmail };
