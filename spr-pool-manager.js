/**
 * =================================================================
 * Smart Predictive Ride Pooling (SPR) Manager
 * =================================================================
 * This file acts as a self-contained, simulated backend for the
 * ride pooling feature. It manages all data and logic, using
 * localStorage to persist the state across page loads.
 *
 * How it works:
 * 1. It automatically checks if predictive pools should be created.
 * 2. It provides simple functions (like an API) for other pages to use.
 * 3. It handles all the data storage and manipulation internally.
 */

const SPR_POOL_MANAGER = (() => {
    // --- SIMULATED USERS ---
    const currentUser = { userId: 'student123', name: 'Priya S.' };
    const currentDriver = { driverId: 'driver007', name: 'Suresh K.' };

    // --- PREDICTIVE LOGIC ---
    // This simulates a calendar of high-demand events.
    const highDemandEvents = {
        // Format: 'Month-Day'
        // Forcing a high-demand event for today for demonstration purposes.
        [`${new Date().getMonth() + 1}-${new Date().getDate()}`]: 'Holiday Rush'
    };

    const STORAGE_KEY = 'ridePools';

    // --- CORE DATA FUNCTIONS ---
    function getPoolsFromStorage() {
        const pools = localStorage.getItem(STORAGE_KEY);
        return pools ? JSON.parse(pools) : [];
    }

    function savePoolsToStorage(pools) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));
    }

    function clearAllPools() {
        console.log("Clearing all ride pool data from localStorage for a fresh start.");
        localStorage.removeItem(STORAGE_KEY);
    }

    // --- "API" FUNCTIONS ---

    /**
     * Generates predictive pools based on the highDemandEvents calendar.
     * This is the "smart" part of the feature.
     */
    function generatePredictivePools() {
        let pools = getPoolsFromStorage();
        const today = new Date();
        const todayKey = `${today.getMonth() + 1}-${today.getDate()}`;

        if (highDemandEvents[todayKey]) {
            const destination = "Tirupati Railway Station";
            // Check if a similar pool doesn't already exist
            const poolExists = pools.some(p => p.destination === destination && p.status === 'PENDING');

            if (!poolExists) {
                console.log("High-demand day detected! Generating a predictive pool.");
                const departureTime = new Date();
                departureTime.setHours(18, 0, 0, 0); // Set for 6:00 PM today

                const newPool = {
                    poolId: 'pool-' + Date.now(),
                    destination: destination,
                    pickupLocation: 'MBU Campus',
                    departureTime: departureTime.toISOString(),
                    capacity: 4, // Updated capacity
                    passengers: [],
                    pricePerHead: 50,
                    status: 'PENDING',
                    driverId: null,
                    driverName: null
                };
                pools.push(newPool);
                savePoolsToStorage(pools);
            }
        }
    }

    /**
     * Allows a student to create a new ride pool.
     */
    function createPool(poolData) {
        let pools = getPoolsFromStorage();
        const newPool = {
            poolId: 'pool-' + Date.now(),
            destination: poolData.destination,
            pickupLocation: poolData.pickupLocation,
            departureTime: poolData.departureTime,
            capacity: 4, // All pools now have a capacity of 4
            passengers: [],
            pricePerHead: 50, // This could be made dynamic in the future
            status: 'PENDING',
            driverId: null,
            driverName: null,
            createdBy: currentUser.userId // Track who created the pool
        };
        pools.push(newPool);
        savePoolsToStorage(pools);
        return { success: true, message: 'Pool created' };
    }

    /**
     * Allows a student to join a ride pool.
     */
    function joinPool(poolId) {
        let pools = getPoolsFromStorage();
        const pool = pools.find(p => p.poolId === poolId);

        if (!pool) return { success: false, message: "Pool not found!" };
        if (pool.passengers.length >= pool.capacity) return { success: false, message: "Sorry, this pool is already full." };
        if (pool.passengers.some(p => p.userId === currentUser.userId)) return { success: false, message: "You have already joined this pool." };

        pool.passengers.push(currentUser);

        let notificationMessage = "Joined the pool!";

        // If pool is now full and has a driver, confirm it.
        if (pool.passengers.length === pool.capacity && pool.driverId) {
            pool.status = 'CONFIRMED';
            notificationMessage = `Pool to ${pool.destination} is now full and confirmed! Your ride is scheduled.`;
        }

        savePoolsToStorage(pools);
        return { success: true, message: notificationMessage };
    }

    /**
     * Allows a student to exit a ride pool.
     */
    function exitPool(poolId) {
        let pools = getPoolsFromStorage();
        const poolIndex = pools.findIndex(p => p.poolId === poolId);
        if (poolIndex === -1) {
            return { success: false, message: "Pool not found!" };
        }

        let pool = pools[poolIndex];
        const passengerIndex = pool.passengers.findIndex(p => p.userId === currentUser.userId);

        if (passengerIndex === -1) {
            return { success: false, message: "You are not in this pool." };
        }

        // Remove user from passengers
        pool.passengers.splice(passengerIndex, 1);

        // If the pool is now empty, delete it.
        if (pool.passengers.length === 0) {
            pools.splice(poolIndex, 1);
            savePoolsToStorage(pools);
            return { success: true, message: "Pool exited." };
        }

        // If the pool was confirmed, it's now back to accepted (since a spot is open)
        if (pool.status === 'CONFIRMED') {
            pool.status = 'ACCEPTED';
        }
        
        pools[poolIndex] = pool;
        savePoolsToStorage(pools);
        return { success: true, message: "Pool exited." };
    }

    

    /**
     * Allows a driver to accept a ride pool.
     */
    function assignDriver(poolId) {
        let pools = getPoolsFromStorage();
        const pool = pools.find(p => p.poolId === poolId);

        if (!pool) return { success: false, message: "Pool not found!" };
        if (pool.driverId) return { success: false, message: "This pool has already been accepted." };

        pool.driverId = currentDriver.driverId;
        pool.driverName = currentDriver.name;
        pool.status = 'ACCEPTED'; // Driver is assigned, waiting for more passengers.

        let notificationMessage = `You have accepted the pool to ${pool.destination}. You will be notified when it's full.`;

        // If pool is full, confirm it.
        if (pool.passengers.length === pool.capacity) {
            pool.status = 'CONFIRMED';
            notificationMessage = `Pool to ${pool.destination} is now confirmed! The ride is ready.`;
        }

        savePoolsToStorage(pools);
        return { success: true, message: notificationMessage };
    }

    // --- PUBLIC INTERFACE ---
    // Expose only the necessary functions to the outside world.
    return {
        init: () => {
            generatePredictivePools();
        },
        joinPool,
        createPool,
        exitPool,
        assignDriver,
        getCurrentUser: () => currentUser,
        getAvailablePoolsForStudent: () => getPoolsFromStorage().filter(p => ['PENDING', 'ACCEPTED'].includes(p.status)),
        getAvailablePoolsForDriver: () => getPoolsFromStorage().filter(p => p.status === 'PENDING' && !p.driverId),
        getMyJoinedPool: () => getPoolsFromStorage().find(p => p.passengers.some(passenger => passenger.userId === currentUser.userId))
    };
})();
