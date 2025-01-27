class Util {
    /**
     * Extracts only the specified fields from an object and returns a new object that only contains those fields
     * @static
     * @param {Object} o - The input object
     * @param {...string} fields - The name of the fields to insert in the new object
     * @returns {Object} A new object containing only the specified fields
     */

    static pick(o, ...fields) {
        return Object.fromEntries(
            Object.entries(o).filter(([key, value]) => fields.includes(key))
        )
    }
}
export default Util