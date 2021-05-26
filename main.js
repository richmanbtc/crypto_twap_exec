const ccxt = require('ccxt')
const { program } = require('commander')
const log4js = require('log4js')

program.version('1.0.0')
program
    .option('--exchange <type>', 'exchange (bitflyer/ftx)')
    .option('--subaccount <type>', 'subaccount')
    .option('--duration <number>', 'execution duration', 0)
    .option('--total_size <number>', 'total execution size', 0)
    .option('--log_level <type>', 'log level', 'debug')
    .option('--interval <number>', 'loop interval sec', 5 * 60)
    .option('--dry', 'dry run')

program.parse(process.argv)

const options = program.opts()

const logger = log4js.getLogger()
logger.level = options.log_level

logger.info(JSON.stringify(options))

const productCode = 'BTC_JPY'
const duration = +options.duration
const totalSize = Math.abs(+options.total_size)
const side = +options.total_size > 0 ? 'buy' : 'sell'
const sizeUnit = 0.01
const interval = +options.interval

if (duration <= 0) {
    logger.error('duration must be positive')
    process.exit(1)
}

if (interval <= 0) {
    logger.error('interval must be positive')
    process.exit(1)
}

if (totalSize === 0) {
    logger.error('totalSize must be nonzero')
    process.exit(1)
}

const createClient = () => {
    if (options.exchange === 'bitflyer') {
        return new ccxt.bitflyer({
            apiKey: process.env.BITFLYER_API_KEY,
            secret: process.env.BITFLYER_API_SECRET
        })
    } else if (options.exchange === 'ftx') {
        return new ccxt.ftx({
            apiKey: process.env.FTX_API_KEY,
            secret: process.env.FTX_API_SECRET,
            headers: {
                'SUBACCOUNT': options.subaccount,
            }
        })
    } else {
        throw new Exception('unknown exchange')
    }
}

const client = createClient();

(async () => {
    logger.info('test api key')
    const res = await bitflyer.privateGetGetpositions({
        'product_code': productCode
    })
    logger.info(`privateGetGetpositions response ${JSON.stringify(res)}`)
    start()
})()

const start = () => {
    const startedAt = (new Date()).getTime() / 1000
    let executedSize = 0

    const getOrderSize = () => {
        const now = (new Date()).getTime() / 1000
        let t = (now - startedAt) / duration
        t = Math.max(0, Math.min(1, t))
        const targetExecutedSize = totalSize * t
        let orderSize = targetExecutedSize - executedSize
        orderSize = Math.floor(orderSize / sizeUnit) * sizeUnit
        return orderSize
    }

    const timer = setInterval(async () => {
        try {
            const now = (new Date()).getTime() / 1000
            const elapsedTime = now - startedAt
            logger.info(`elapsedTime ${elapsedTime} / ${duration} = ${elapsedTime / duration}`)
            if (elapsedTime > duration) {
                logger.info('execution finished')
                clearInterval(timer)
                return
            }

            const orderSize = getOrderSize()
            logger.info(`orderSize ${orderSize} executedSize ${executedSize}`)
            if (orderSize == 0) {
                logger.info('order skipped')
                return
            }

            const params = {
                'product_code': productCode,
                'child_order_type': 'MARKET',
                'side': side.toUpperCase(),
                'size': orderSize,
                'minute_to_expire': 1,
                'time_in_force': 'GTC'
            }
            logger.info(`send order ${JSON.stringify(params)}`)
            if (options.dry) {
                logger.info(`dry run`)
            } else {
                const res = await bitflyer.privatePostSendchildorder(params)
                logger.info(`send order response ${JSON.stringify(res)}`)
            }
            executedSize += orderSize // ignore error
            executedSize = Math.round(executedSize / sizeUnit) * sizeUnit
        } catch (err) {
            logger.error(err)
        }
    }, interval * 1000)
}

