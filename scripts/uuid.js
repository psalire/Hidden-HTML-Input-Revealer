/* https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
function uuidv4() {
    return 'u_'+(([1e7]+'_'+1e3+'_'+4e3+'_'+8e3+'_'+1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
    );
}