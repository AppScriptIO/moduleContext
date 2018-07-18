/**
 * @class
 * @description class used to store module instances as a way to cache them by reference key name in the array. Giving essentially a context for each saved module instance.
 **/
const self = class ModuleContext {
    
    methodInstance = []
    static methodInstance = []

    constructor(createModuleInstance) {
        /**
         * @param {string} methodInstanceName the key name used to save the created instance or null for creating without saving.
         * @param {multipleArguments} ... spread operator, unique parameters different depending on the function passed.
         * @returns {instance} class instance of the module being required.
         */
        this.createModuleInstance = createModuleInstance
    }

    /**
     * 
     * 
     * @param {string} [methodInstanceName=null] key name of saved or being saved instance.
     * @param {array} [args=[]] parameters to be called for createModuleInstance i.e. the function passed for creating ModuleContext class instance.
     * @param {boolean} [importerName=null] debug on/off.
     * @returns instance of a module, either created newly or returned from cache.
     */
    getMethodInstance(methodInstanceName = null, args = [], importerName = null) {
        let debug = (importerName) ? true : false;
        if(debug) console.log(importerName) // Debug purposes to check which file impoerted it.
        let instance;
        if(methodInstanceName && typeof this.methodInstance[methodInstanceName] !== 'undefined')  {
            if(debug) console.log('already defined !')
            instance = this.methodInstance[methodInstanceName]
        } else if(methodInstanceName) {
            if(debug) console.log('create new instance !')
            this.methodInstance[methodInstanceName] = this.createModuleInstance(methodInstanceName, ...args) // add name to argument so ti cab be accessed by createModuleInstance.
            instance = this.methodInstance[methodInstanceName]
        } else {
            if(debug) console.log('create without saving !')
            instance = this.createModuleInstance(null, ...args)
        }
        return instance;
    }

    getMethodInstance2({
        methodInstanceName = null,
        args = {} /** <Object> */
    }) {
        let instance;
        if(methodInstanceName && typeof this.methodInstance[methodInstanceName] !== 'undefined')  {
            // if(debug) console.log('already defined !')
            instance = this.methodInstance[methodInstanceName]
        } else if(methodInstanceName) {
            // if(debug) console.log('create new instance !')
            this.methodInstance[methodInstanceName] = this.createModuleInstance(Object.assign({ methodInstanceName }, args)) // add name to argument so ti cab be accessed by createModuleInstance.
            instance = this.methodInstance[methodInstanceName]
        } else {
            // if(debug) console.log('create without saving !')
            instance = this.createModuleInstance(null, ...args)
        }
        return instance;
    }

}



export { self as default }