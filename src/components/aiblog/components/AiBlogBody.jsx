import { useState } from 'react';
import {
    Button,
    Box,
    Center,
    VStack,
    Input,
    Textarea,
    useColorModeValue
} from '@chakra-ui/react';

const AiBlogBody = () => {
    const [prompt, setPrompt] = useState('') 
    const [isLoading, setLoading] = useState(false)
    const [content, setContent] = useState('')
    const inputBg = useColorModeValue('white', '#1A202C');
    const openai_api_key = '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'

    const changeHandle = (e) => {
        let inputValue = e.target.value;
        setPrompt(inputValue)
        console.log('prompts', prompt)
    }

    const generateBlog = async () => {
        setLoading(true)
        console.log('gpt-3.5-turbo-prompt', prompt)
        const response = await fetch(`https://api.openai.com/v1/chat/completions`,
          {
            body: JSON.stringify({
              'model': 'gpt-3.5-turbo',
              'messages': [
                { role: 'system', content: 'You are the chatbot to assit the users' },
                { role: 'user', content: 'What is your name?' },
                { role: 'assistant', content: 'My name is Gpt-3.5-turbo Chatbot.' },
                { role: 'user', content: prompt }
              ],
              'temperature': 0.3,
              'max_tokens': 500
            }),
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + String(openai_api_key)
            }
          })
          setLoading(false)
          const data = await response.json()
          console.log("gpt-3.5-turbo", data)
          setContent(data.choices[0].message.content)
          console.log("content", content)
      }

    return (
        <>
            <Box py={20}>
                <Center>
                    <VStack spacing={6} w='60%'>
                        <Textarea
                            placeholder={`Describe the blog which you want to generate`}
                            bg={inputBg}
                            w={'100%'}
                            h={'150'}
                            defaultValue={content}
                            onChange={changeHandle}
                            onKeyPress={e=> {
                                if (e.key === 'Enter') {
                                   generateBlog(prompt)
                                }
                             }}
                             value={content}
                        />
                        <Button isLoading={isLoading} onClick={generateBlog}>Generate a Blog content</Button>
                    </VStack>
                </Center>
            </Box>
        </>
    );
};

export default AiBlogBody;
