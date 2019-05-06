/**
 * Caches modules on demand using a unique key name.
 * Usage options:
 *  • With key - Once during app initialization, where references are saved (hard link) to a string key - e.g. "condition", "middleware".
 *  • Anonymous - Several times during app runtime, where instances should be garbage collected - e.g. template.
 */

const ModuleContextCachedList = {} // all ModuleContext cached classes

// Interfaces: expose as 'new' keyword or function call.
export default new Proxy(function() {}, {
  /**
   *  Create cache of module context before creating a cache for target.
   */
  apply: (target, thisArg, argumentsList) => {
    return contextReference(...argumentsList)
  },
  // Use ContextModule without caching.
  construct: (target, argumentsList, newTarget) => {
    const Class = contextReference()
    return new Class(...argumentsList)
  },
})

/**
 * Create context for 'moduleContext' class
 */
function contextReference({
  cacheReferenceName = null, // cache reference name. In case specified the ModuleContext class would be cached
} = {}) {
  let context
  if (cacheReferenceName && ModuleContextCachedList[cacheReferenceName]) {
    context = ModuleContextCachedList[cacheReferenceName]
  } else if (cacheReferenceName) {
    context = ModuleContextCachedList[cacheReferenceName] = createClassScope({ cacheReferenceName })
  } else {
    context = createClassScope()
  }
  return context
}

/*
 * Returns ModuleContext class either cached or not.
 */
function createClassScope({ cacheReferenceName } = {}) {
  const self = class ModuleContext {
    static targetCachedList = {} // list of cached target objects
    static targetCounter = {
      // number of created target objects.
      cached: 0,
      nonReferenced: process.env.SZN_DEBUG ? 0 : null, // targets not meant to be cached, only for debug puposes.
    }

    // @returns a proxified version of target.
    constructor({ target, cacheName = null }) {
      /* this = cache module context */
      this.cacheName = cacheName
      let proxified = this.proxify(target)
      return proxified
    }

    // proxy wraps target object
    proxify(target) {
      let cacheContext = this
      let handler = {
        // add 'moduleContext' as getter property of the target.
        get: (target, property, receiver) => {
          if (property == 'moduleContext') {
            return cacheContext
          } else {
            return target[property]
          }
        },
        // implementation for functions - cache functions when called with same cacheName
        apply: (target, thisArg, argumentsList) => {
          let instance
          if (cacheContext.cacheName && self.targetCachedList[cacheContext.cacheName]) {
            instance = self.targetCachedList[cacheContext.cacheName] // return result of cached previous call.
          } else if (cacheContext.cacheName) {
            if (typeof argumentsList[0] == 'object') {
              self.targetCachedList[cacheContext.cacheName] = target.call(thisArg, Object.assign({ methodInstanceName: cacheContext.cacheName }, argumentsList[0]))
            } else {
              self.targetCachedList[cacheContext.cacheName] = target.call(thisArg, ...argumentsList)
            }
            instance = self.targetCachedList[cacheContext.cacheName]
            self.targetCounter.cached++
          } else {
            instance = target.call(thisArg, ...argumentsList)
            // Cache targets not needed to be referenced only in debug mode.
            if (process.env.SZN_DEBUG) {
              // for debug purposes, cache target objects with automatically named references.
              self.targetCounter.nonReferenced++
              self.targetCachedList[Symbol.for(`${target.name} ${self.targetCounter.nonReferenced}` /*create a name that is more understandable*/)] = instance
            }
          }
          return instance
        },
      }
      return new Proxy(target, handler)
    }
  }

  // add getter to reitrive the cache list of static classes 'ContextModule' (defining getter on an existing object)
  Object.defineProperty(self, 'ModuleContextCachedList', {
    get: function() {
      return ModuleContextCachedList // return ModuleContextCachedList variable in module scope.
    },
  })
  // add reference used to cache the class if any
  if (cacheReferenceName) self.cacheReferenceName = cacheReferenceName

  return self
}
