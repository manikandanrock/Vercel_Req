// Chatbot.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import ReactMarkdown from 'react-markdown';
import ChatContext from './ChatContext';

// Theme configuration (updated to match screenshot)
const theme = {
  primary: '#000000',
  botBackground: '#FFFFFF',
  userText: '#FFFFFF',
  botText: '#000000',
  background: '#F9FAFF',
  inputBackground: '#FFFFFF',
  error: '#D32F2F',
  errorBg: '#FFEBEE',
  borderRadius: '10px', // Updated to match screenshot
  shadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  shadowHover: '0 6px 16px rgba(0, 0, 0, 0.12)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  navbarHeight: '75px',
  clearButton: '#FF3A3A',
  disabled: '#CCCCCC',
  disabledText: '#666666',
};

// Animations
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// Styled components (updated)
const ChatContainer = styled.div`
  position: fixed;
  top: ${theme.navbarHeight};
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  background: white;
  z-index: 999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    top: 60px;
  }
`;

const Header = styled.header`
  padding: 16px 24px;
  height: ${theme.navbarHeight};
  background-color: ${theme.primary};
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: ${theme.shadow};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 12px 16px;
    gap: 8px;
  }
`;

const Logo = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 33px;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 24px;
  }
`;

const ProjectSelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const ProjectSelectLabel = styled.label`
  color: white;
  font-size: 0.875rem;
`;

const ProjectSelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.5); // Updated to match screenshot
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: ${theme.transition};
  max-width: 200px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.8);
    background: rgba(0, 0, 0, 0.6);
  }

  option {
    background: ${theme.primary};
    color: white;
  }

  @media (max-width: 768px) {
    max-width: 150px;
    font-size: 0.75rem;
    padding: 6px 10px;
  }
`;

const ClearButton = styled.button`
  background-color: ${theme.clearButton};
  color: #ffffff;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(255, 255, 255, 0.1);
  transition: ${theme.transition};

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &:active {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.75rem;
  }
`;

const MessagesContainer = styled.main`
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${theme.background};
  min-height: 200px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const MessageContainer = styled.div`
  max-width: 75%;
  min-width: 200px;
  width: fit-content;
  text-align: left;
  padding: 16px;
  border-radius: ${(props) =>
    props.role === 'user'
      ? `${theme.borderRadius} ${theme.borderRadius} 8px ${theme.borderRadius}`
      : `8px ${theme.borderRadius} ${theme.borderRadius} ${theme.borderRadius}`};
  background: ${(props) => (props.role === 'user' ? theme.primary : theme.botBackground)};
  color: ${(props) => (props.role === 'user' ? theme.userText : theme.botText)};
  align-self: ${(props) => (props.role === 'user' ? 'flex-end' : 'flex-start')};
  box-shadow: ${theme.shadow};
  transition: ${theme.transition};
  margin: 8px 0;
  word-break: break-word;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:hover {
    box-shadow: ${theme.shadowHover};
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    min-width: 150px;
    padding: 12px;
  }
`;

const TimeStamp = styled.time`
  align-self: flex-end;
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 8px;
  display: block;
  width: 100%;
  text-align: right;
`;

const MarkdownWrapper = styled.div`
  font-size: 0.9375rem;
  line-height: 1.6;

  strong {
    color: ${theme.primary};
    font-weight: 600;
  }

  em {
    color: ${theme.primary};
    font-style: italic;
  }

  ul,
  ol {
    padding-left: 24px;
    margin: 8px 0;
  }

  li {
    margin: 4px 0;
  }

  code {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
  }

  pre {
    background: ${theme.botBackground};
    padding: 12px;
    border-radius: ${theme.borderRadius};
    overflow-x: auto;
    margin: 12px 0;
  }
`;

const InputArea = styled.div`
  padding: 16px 24px;
  background-color: ${theme.inputBackground};
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  position: relative;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 20px;
  border-radius: ${theme.borderRadius};
  border: 1px solid ${theme.primary}30;
  background: ${theme.inputBackground};
  font-size: 0.9375rem;
  transition: ${theme.transition};
  box-shadow: ${theme.shadow};
  outline: none;

  &:focus {
    border-color: ${theme.primary}60;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.3); // Increased opacity for visibility
  }

  &:disabled {
    background-color: ${theme.disabled};
    color: ${theme.disabledText};
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.875rem;
  }
`;

const SendButton = styled.button`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.primary};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: ${theme.transition};

  &:disabled {
    background-color: ${theme.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover:not(:disabled) {
    transform: scale(1.1); // Increased for better visibility
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const LoadingIndicator = styled.div`
  align-self: flex-start;
  padding: 12px 16px;
  border-radius: ${theme.borderRadius};
  background-color: ${theme.botBackground};
  box-shadow: ${theme.shadow};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${theme.primary};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const ErrorMessage = styled.div`
  padding: 12px 24px;
  background-color: ${theme.errorBg};
  color: ${theme.error};
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  overflow-x: auto;
`;

const NoProjectMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #757575;
  font-size: 1rem;
  background: ${theme.background};
`;

const Chatbot = () => {
  const { getMessages, setMessages, clearMessages } = useContext(ChatContext);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const messagesEndRef = useRef(null);
  const API_BASE_URL = 'http://ec2-57-181-26-31.ap-northeast-1.compute.amazonaws.com';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/projects`);
        setProjects(response.data);
        if (response.data.length > 0) {
          setSelectedProject({ id: response.data[0].id, name: response.data[0].name });
        }
      } catch (err) {
        setError('Failed to fetch projects. Please try again.');
      }
    };
    fetchProjects();
  }, []);

  const messages = selectedProject ? getMessages(selectedProject.id) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    const project = projects.find((p) => p.id === parseInt(projectId));
    setSelectedProject(project ? { id: project.id, name: project.name } : null);
  };

  const formatMessageContent = (content, role) => {
    if (role === 'bot') {
      return (
        <MarkdownWrapper>
          <ReactMarkdown
            components={{
              strong: ({ node, ...props }) => (
                <strong style={{ color: theme.primary }} {...props} />
              ),
              em: ({ node, ...props }) => (
                <em style={{ color: theme.primary }} {...props} />
              ),
              code: ({ node, ...props }) => (
                <code
                  style={{
                    background: `${theme.primary}10`,
                    color: theme.primary,
                  }}
                  {...props}
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </MarkdownWrapper>
      );
    }

    return content.split(/(r\d+|\(\d+,\s\d+\))/g).map((part, index) =>
      /(r\d+|\(\d+,\s\d+\))/.test(part) ? (
        <strong
          key={index}
          style={{
            color: theme.primary,
            padding: '2px 4px',
            borderRadius: '4px',
            backgroundColor: `${theme.primary}10`,
          }}
        >
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !selectedProject) return;

    try {
      const userMessage = {
        content: inputMessage,
        role: 'user',
        timestamp: new Date().toISOString(),
      };

      setMessages(selectedProject.id, [...messages, userMessage]);
      setInputMessage('');
      setIsLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: inputMessage,
        project_id: selectedProject.id,
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || 'API request failed');
      }

      const botMessage = {
        content: response.data.response,
        role: 'bot',
        timestamp: new Date().toISOString(),
        stats: response.data.stats,
      };

      setMessages(selectedProject.id, [...messages, userMessage, botMessage]);
    } catch (err) {
      setError(err.message || 'Failed to get response. Please try again.');
      setMessages(selectedProject.id, messages.filter((msg) => msg.content !== inputMessage));
    } finally {
      setIsLoading(false);
    }
  };

  if (projects.length === 0 && !error) {
    return (
      <ChatContainer>
        <Header>
          <div>
            <h1>Requirements Assistant</h1>
            <p>Powered by Gemini AI</p>
          </div>
        </Header>
        <NoProjectMessage>Loading projects...</NoProjectMessage>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <Header>
        <div>
          <h1>Requirements Assistant</h1>
          <p>Powered by Gemini AI</p>
        </div>
        <ProjectSelectWrapper>
          <ProjectSelectLabel htmlFor="project-select">Project:</ProjectSelectLabel>
          <ProjectSelect id="project-select" value={selectedProject ? selectedProject.id : ''} onChange={handleProjectChange}>
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </ProjectSelect>
        </ProjectSelectWrapper>
        {selectedProject && (
          <ClearButton onClick={() => clearMessages(selectedProject.id)}>
            Clear Chat
          </ClearButton>
        )}
      </Header>

      {!selectedProject ? (
        <NoProjectMessage>Please select a project to start chatting.</NoProjectMessage>
      ) : (
        <>
          <MessagesContainer>
            {messages.map((message, index) => (
              <MessageContainer key={`${message.timestamp}-${index}`} role={message.role}>
                <div>
                  {formatMessageContent(message.content, message.role)}
                  {message.stats && (
                    <button
                      aria-label="System stats"
                      className="stats-button"
                      title={`Approved: ${message.stats.approved}\nIn Review: ${message.stats.inReview}\nDisapproved: ${message.stats.disapproved}`}
                    >
                      ?
                    </button>
                  )}
                </div>
                <TimeStamp>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TimeStamp>
              </MessageContainer>
            ))}

            {isLoading && (
              <LoadingIndicator>
                <Spinner />
                <span>Analyzing requirements...</span>
              </LoadingIndicator>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputArea>
            <InputWrapper>
              <Input
                type="text"
                aria-label="Type your message"
                placeholder="Ask about requirements..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                disabled={isLoading}
              />
              <SendButton
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12L21 12M21 12L12.6 3.6M21 12L12.6 20.4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </SendButton>
            </InputWrapper>
          </InputArea>
        </>
      )}

      {error && (
        <ErrorMessage role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={theme.error}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </ErrorMessage>
      )}
    </ChatContainer>
  );
};

export default Chatbot;
