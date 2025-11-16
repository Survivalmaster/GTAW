/**
 * @param {string} selected
 * @param {string} ratingOption
 * @returns {string}
 */
export function getRatingToken(selected, ratingOption) {
  return selected === ratingOption ? "[cbc][/cbc]" : "[cb][/cb]";
}

/**
 * @param {string} groupName
 * @returns {string} Selected radio value, or empty string
 */
export function getSelectedValue(groupName) {
  const selected = document.querySelector(`input[name="${groupName}"]:checked`);
  return selected ? selected.value : "";
}

/**
 * @param {string} radioName
 * @returns {{yes: string, no: string}}
 */
export function getOrientationToken(radioName) {
  const selected = document.querySelector(`input[name="${radioName}"]:checked`);
  const value = selected ? selected.value : "";

  if (value === "1") {
    return { yes: "[cbc][/cbc]", no: "[cb][/cb]" };
  } else if (value === "2") {
    return { yes: "[cb][/cb]", no: "[cbc][/cbc]" };
  } else {
    return { yes: "[cb][/cb]", no: "[cbc][/cbc]" };
  }
}