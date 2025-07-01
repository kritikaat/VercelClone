const express = require('express')
const {generateSlug} = require('random-word-slugs')
const {ECSClient, RunTaskCommand} = require('@aws-sdk/client-ecs')
const app = express()
const PORT = 9000

const ecsClient = new ECSClient({
    region: 'ap-south-1',
    credentials:{
        accessKeyId:'ACESSKEYID',
        secretAccessKey:'SECRETACESSKEY'
    }
})

const config = {
    CLUSTER : 'YOUR_CLUSTER',
    TASK: 'YOUR_TASK'
}

app.use(express.json())

app.post('/project', async (req,res)=>{
    const { gitURL } = req.body
    const projectslug = generateSlug()

    //spin the container
    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration:{
                assignPublicIp: 'ENABLED',
                subnets:[ 'SUBNET1', 'SUBNET2', 'SUBNET3'],
                securityGroups : ['SECURITY_GROUP']
            },
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'YOUR_CONTAINER_NAME',
                    environment:[
                        {name:'GIT_REPOSITORY_URL', value: gitURL},
                        {name:'PROJECT_ID',value: projectslug}
                    ]
                }
            ]
        }
    })

    await ecsClient.send(command);
     
    return res.json({ status: 'queued', data:{ projectslug, url: `http://${projectslug}.localhost:8000/ `}})
})

app.listen(PORT, () => console.log(`API server running.. ${PORT}`) )