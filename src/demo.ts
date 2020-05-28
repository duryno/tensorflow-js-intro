import * as mobilenet from '@tensorflow-models/mobilenet'
import * as knnClassifier from '@tensorflow-models/knn-classifier'

export class Demo {
    private model: mobilenet.MobileNet
    private classifier: knnClassifier.KNNClassifier
    trainingData: any[] = []
    validationData: any[] = []

    private IMAGE_SIZE = 30

    constructor() {
        void this.run()
    }

    async run(): Promise<void> {
        this.model = await mobilenet.load()
        this.classifier = knnClassifier.create()

        this.trainingData = await this.getTrainingData()
        this.validationData = await this.getValidationData()

        console.log('[training]', this.trainingData)
        console.log('[validation]', this.validationData)

        await this.train()
        await this.evaluate()

        this.classifier.dispose()
    }

    async train() {
        for (const data of this.trainingData) {
            const i = this.model.infer(data.image)
            this.classifier.addExample(i, data.label)
        }
    }

    async evaluate() {
        let correctPredictionsCounter = 0
        for (const data of this.validationData) {
            const i = this.model.infer(data.image)
            const predictions = await this.classifier.predictClass(i)
            if (data.label === predictions.label) correctPredictionsCounter++
            console.log('[prediction] label:', data.label, predictions)
        }

        const accuracy = correctPredictionsCounter / this.validationData.length
        console.log('[accuracy]', accuracy)
    }

    async getTrainingData(): Promise<any[]> {
        return await this.loadData('/data/training')
    }

    async getValidationData(): Promise<any[]> {
        return await this.loadData('/data/validation')
    }

    async loadData(path: string): Promise<any[]> {
        const data = []

        const json = await fetch(`${path}.json`)
        const files = await json.json()

        return new Promise(async resolve => {
            for (let dir of Object.keys(files)) {
                for (let img of files[dir]) {
                    const imgElem = new Image()
                    imgElem.width = this.IMAGE_SIZE
                    imgElem.height = this.IMAGE_SIZE
                    imgElem.src = `${path}/${dir}/${img}`
                    document.body.append(imgElem)

                    await this.delay(15)
    
                    data.push({image: imgElem, label: dir})
                }
            }
            resolve(data)
        })
    }

    async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(() => resolve(), ms))
      }

}