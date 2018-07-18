/**
 * Caches modules on demand using a unique key name. 
 * Usage options: 
 *  • With key - Once during app initialization, where references are saved (hard link) to a string key - e.g. "condition", "middleware".
 *  • Anonymous - Several times during app runtime, where instances should be garbage collected - e.g. template.
 */

const list = {} // ModuleContext Instances

export default new Proxy(function(){}, {
    apply: (target, thisArg, argumentsList) => {
        return contextReference(...argumentsList)
    }, 
    construct: (target, argumentsList, newTarget) => {
        const Class = contextReference()
        return new Class(...argumentsList)
    }
})

function contextReference({ referenceName = null } = {}) {
    let context; 
    if(referenceName && list[referenceName]) {
        context = list[referenceName]
    } else if(referenceName) {
        context = list[referenceName] = createContext()
    } else {
        context = createContext()
    }
    return context
}

function createContext() {
    const self = class ModuleContext {
        
        static list = {}

        constructor({ target, cacheName = null }) {
            /* this = cache module context */
            this.counter = 0
            this.cacheName = cacheName
            let proxified = this.proxify(target)
            return proxified
        }
        
        proxify(target) {
            let cacheContext = this
            let handler = {
                get: (target, property, receiver) => {
                    if(property == 'moduleContext') return cacheContext;
                },
                apply: (target, thisArg, argumentsList) => {
                    let instance
                    cacheContext.counter ++
                    if(cacheContext.cacheName && self.list[cacheContext.cacheName]) {
                        instance = self.list[cacheContext.cacheName]
                    } else if(cacheContext.cacheName) {
                        if(typeof argumentsList[0] == 'object' ) {
                            self.list[cacheContext.cacheName] = target.call(thisArg, Object.assign({ methodInstanceName: cacheContext.cacheName }, argumentsList[0]))
                        } else {
                            self.list[cacheContext.cacheName] = target.call(thisArg, ...argumentsList)
                        }
                        instance = self.list[cacheContext.cacheName]
                    } else {
                        instance = target.call(thisArg, ...argumentsList)
                    }
                    return instance
                }
            }
            return new Proxy(target, handler)
        }
    }
    return self        
}