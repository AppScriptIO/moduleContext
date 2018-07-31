import assert from 'assert'
import ModuleContext from './entrypoint.js'

const func = function (superclass) {
    return class extends superclass {}
}
const superclass = class {}    

describe('Module Cacher', () => {
    beforeEach(() => {
    })
    
    describe('Different ways of instantiating ModuleContext', () => {
        let MCFunc = ModuleContext()
        let MCObject = new MCFunc({ target: func })
        let MCDirectObject = new ModuleContext({ target: func })

        it('should be a class', () => {
            assert.equal(typeof MCFunc, 'function')
        })
        
        it('should be a function as target', () => {
            assert.equal(typeof MCObject, typeof func)
        })

        it('should be a function as target', () => {
            assert.equal(typeof MCDirectObject, typeof func)
        })
        // console.log(typeof MCDirectObject)
    })

    describe('Caching module in different instances', () => {
        let MCClass = ModuleContext()

        let proxiedFunc  = new MCClass({ target: func, cacheName: '1'})

        let moduleInstance1 = proxiedFunc(superclass)
        let moduleInstance2 = proxiedFunc(superclass)
        let moduleInstance3 = proxiedFunc(superclass)

        it('should be a function (class)', () => {
            assert.equal(typeof moduleInstance1, 'function')
        })

        it('should return cached instance on second call', () => {
            assert.strictEqual(moduleInstance1, moduleInstance2)
        })

        it('should create a single instance and cache it inside list object', () => {
            assert.strictEqual(Object.keys(MCClass.list).length, 1)
        })

    })

    describe('Using module without caching reference, i.e. creating new module instance each time.', () => {
        let MCClass = ModuleContext()
        
        let proxiedFunc  = new MCClass({ target: func })

        let moduleInstance1 = proxiedFunc(superclass)
        let moduleInstance2 = proxiedFunc(superclass)
        let moduleInstance3 = proxiedFunc(superclass)

        it('should create different instances', () => {
            assert.notStrictEqual(moduleInstance1, moduleInstance2)
            assert.notStrictEqual(moduleInstance1, moduleInstance3)
        })
    })

    describe('Using module inside other module instances', () => {
        let MCClass = ModuleContext()
        
        let proxiedFuncX  = new MCClass({ target: func })
        let proxiedFuncY  = new MCClass({ target: func })

        proxiedFuncX.moduleContext.cacheName = 'X'
        proxiedFuncY.moduleContext.cacheName = 'Y'

        let moduleInstance1 = proxiedFuncX(superclass)
        let moduleInstance2 = proxiedFuncY(superclass)

        it('should create two cached module instances inside array.', () => {
            assert.equal(Object.keys(MCClass.list).length, 2)
        })

    })
})


