import { useState, useEffect, useRef } from 'react';
import {
    Button,
    Box,
    Center,
    VStack,
    Heading,
    Textarea,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useColorModeValue,
    useDisclosure
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { client } from 'common/utils';
import { gql } from '@apollo/client';

const EditorBlock = dynamic(() => import("./EditorBlock"), {
    ssr: false,
});
let blogTitle = ''
let blogSlug = ''
let blogDes = []
let blogContent = ''
let public_id = {}

const AiBlogHeader = () => {
    const [prompt, setPrompt] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [isDisable, setDisable] = useState(true)
    const [content, setContent] = useState('')
    const [editorJson, setEditorJson] = useState('')
    const [data, setData] = useState();
    const inputBg = useColorModeValue('white', '#1A202C')
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isPost, onOpen: onPost, onClose: onClosePost } = useDisclosure()
    const cancelRef = useRef()
    const textareaRef = useRef()
    const openai_api_key = `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`

    useEffect(() => {
        setEditorJson(content)
    }, [content])

    const changeHandle = (e) => {
        let inputValue = e.target.value;
        setPrompt(inputValue)
    }

    const generateBlog = async () => {
        if (prompt !== '') {
            setLoading(true)
            setDisable(true)
            const response = await fetch(`https://api.openai.com/v1/chat/completions`,
                {
                    body: JSON.stringify({
                        'model': 'gpt-3.5-turbo',
                        'messages': [
                            { role: 'system', content: 'You are the chatbot to assit the users' },
                            {
                                role: 'user', content: `Create a valid JSON data to match the Editorjs to generate the Blog: {time: timestamp,blocks: [{id: id,type: "header",data: {text: blog title, level: 1}},{id: id,type: "paragraph",data: {text: blog content,}}]} 
                            I am going to write an SEO friendly blog post. Main idea is ${prompt}. The JSON object is:
                            ` }
                        ],
                        'temperature': 0.3,
                        'max_tokens': 3000
                    }),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + String(openai_api_key)
                    }
                })
            setLoading(false)
            setDisable(false)
            const data = await response.json()
            console.log("data.choices[0].message.content", data.choices[0].message.content)
            setContent(data.choices[0].message.content)
            setData(data.choices[0].message.content)
        } else {
            onOpen()
            textareaRef.current.focus()
        }
    }

    const slugify = (str) => {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const getBlogContent = async () => {
        console.log("////////data/////////", data)
        // const { blocks } = JSON.parse(data)
        const { blocks } = data
        if (blocks) {
            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].type === 'header') {
                    if (blocks[i].data.level === 1) {
                        blogTitle = blocks[i].data.text
                    }
                }
                if (blocks[i].type === 'paragraph') {
                    blogDes.push(blocks[i].data.text)
                }
                if (blocks[i].type !== 'image') {
                    blogContent += blocks[i].data.text + '\n'
                }
            }

            blogSlug = slugify(blogTitle)

            const res = await fetch('/api/blog')
            public_id = await res.json()
        }
    }

    const handleChangeEditor = (e) => {
        setData(e)
    }

    const confirmPost = () => {
        onPost()
    }

    const postBlog = async () => {
        onClosePost()
        await getBlogContent()

        const date = new Date()
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        let currentDate = date.toISOString().slice(0,10)

        console.log("/////////////blogTitle///////////////", blogTitle)
        console.log("/////////////blogSlug///////////////", blogSlug)
        console.log("/////////////blogDes///////////////", blogDes[0])
        console.log("/////////////blogContent///////////////", blogContent)
        console.log("/////////////currentDate///////////////", currentDate)
        console.log("/////////////imageUrl///////////////", public_id)

        const desc = blogDes[0]

        const result = await client.mutate({
            mutation: gql`
            mutation createPost($blogTitle: String!, $blogSlug: String!, $desc: String!, $blogContent: String!, $currentDate: Date!, $imageUrl: Json!) {
                createPost(
                  data: {
                    title: $blogTitle, 
                    slug: $blogSlug, 
                    description: $desc, 
                    excerpt: $desc, 
                    featuredPost: true, 
                    sponsored: false, 
                    content: $blogContent, 
                    customPublicationDate: $currentDate, 
                    featuredImage: $imageUrl
                  }
                ) {
                  id
                } 
              }
            `,
            variables: {
                "blogTitle": blogTitle,
                "blogSlug": blogSlug,
                "desc": desc,
                "blogContent": blogContent,
                "currentDate": currentDate,
                "imageUrl": {public_id}
            }
        });

        const draftID = String(result.data.createPost.id)

        console.log("draftID", draftID)

        const published = await client.mutate({
            mutation: gql`
            mutation publishPost {
                publishPost(
                    where: { id: "${draftID}" }, to: PUBLISHED
                ) {
                  id
                } 
              }
            `
        })

        console.log("//////////////IT blog Published//////////////", published)

        if(published) {
            alert("Blog is published")
        }
    }

    return (
        <>
            <Box
                bgGradient={
                    'linear( 102.4deg,  rgba(253,189,85,1) 7.8%, rgba(249,131,255,1) 100.3% )'
                }
            >
                {/* Search input on all screens expect mobile */}
                <Box py={20}>
                    <Center>
                        <VStack spacing={6}>
                            <Heading color={'white'}>
                                What do you want for a blog ?
                            </Heading>
                            <Textarea
                                placeholder={`Describe the blog which you want to generate`}
                                bg={inputBg}
                                w={'130%'}
                                h={'120'}
                                ref={textareaRef}
                                onChange={changeHandle}
                                onKeyPress={e => {
                                    if (e.key === 'Enter') {
                                        generateBlog(prompt)
                                    }
                                }}
                            />
                            <div>
                                <Button isLoading={isLoading} onClick={generateBlog} mr={'5rem'}>Generate a Blog</Button>
                                <Button disabled={isDisable} colorScheme='green' onClick={confirmPost} >Post a Blog</Button>
                            </div>
                            <AlertDialog
                                mt={'200px'}
                                zIndex={200}
                                isOpen={isPost}
                                leastDestructiveRef={cancelRef}
                                onClose={onClose}
                            >
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                            Invalid Value
                                        </AlertDialogHeader>

                                        <AlertDialogBody>
                                            Please input the blog description at least 2 ~ 3 sentences.
                                        </AlertDialogBody>

                                        <AlertDialogFooter>
                                            <Button colorScheme='red' ref={cancelRef} onClick={onClose}>
                                                Ok
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>

                            <AlertDialog
                                mt={'200px'}
                                zIndex={200}
                                isOpen={isPost}
                                leastDestructiveRef={cancelRef}
                                onClose={onClosePost}
                            >
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                            Post a Blog
                                        </AlertDialogHeader>

                                        <AlertDialogBody>
                                            Are you sure to post a Blog?
                                            If you are not sure, please click the Cancel Button.
                                        </AlertDialogBody>

                                        <AlertDialogFooter>
                                            <Button ref={cancelRef} onClick={onClosePost}>
                                                Cancel
                                            </Button>
                                            <Button colorScheme='green' onClick={postBlog} ml={3}>
                                                Post
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>
                        </VStack>
                    </Center>
                </Box>
            </Box>
            <Box py={'2rem'} px={'3rem'}>
                <div className='blog-wrapper' style={{ maxWidth: '800px', width: '800px', height: 'fit-content', minHeight: '500px', margin: '0 auto', overflowY: 'auto' }}>
                    {
                        content && <EditorBlock data={JSON.parse(content)} onChange={handleChangeEditor} holder="editorjs-container" />
                    }
                </div>
                {/* <div className='blog-wrapper' style={{ maxWidth: '800px', width: '800px', height: 'fit-content', minHeight: '500px', margin: '0 auto', overflowY: 'auto' }}>
                    {
                        data && <Output
                            data={data}
                        />
                    }
                </div> */}

            </Box>
        </>
    );
};

export default AiBlogHeader;
