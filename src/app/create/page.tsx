'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { createComment, fetchComments } from '@/lib/api';
import { CommentFormData } from '@/types';

export default function CreateCommentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<CommentFormData>();

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsAuthenticated(isLoggedIn);
      
      if (!isLoggedIn) {
        router.push('/');
        return;
      }
    };
    
    checkAuth();
  }, [router]);

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      // First, get all existing comments from the API to determine the next ID
      const apiComments = await fetchComments();
      
      // Create the comment via API
      const response = await createComment(data);
      
      // Get existing comments from localStorage or initialize empty array
      const existingComments = JSON.parse(localStorage.getItem('comments') || '[]');
      
      // Create a new comment with an ID that's the total count of API comments + 1
      const newComment = {
        ...response,
        id: apiComments.length + 1, // Use the total count of comments from API + 1
        postId: 1 // Default postId
      };
      
      // Add the new comment to the array
      const updatedComments = [...existingComments, newComment];
      
      // Save to localStorage
      localStorage.setItem('comments', JSON.stringify(updatedComments));
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-0 fs-4">Create New Comment</h2>
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    {...register('name', { required: true })}
                    isInvalid={!!errors.name}
                  />
                  {errors.name && (
                    <Form.Control.Feedback type="invalid">
                      Field is required
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    {...register('email', { 
                      required: true,
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address"
                      }
                    })}
                    isInvalid={!!errors.email}
                  />
                  {errors.email && (
                    <Form.Control.Feedback type="invalid">
                      {errors.email.message || "Field is required"}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Enter your comment"
                    {...register('body', { required: true })}
                    isInvalid={!!errors.body}
                  />
                  {errors.body && (
                    <Form.Control.Feedback type="invalid">
                      Field is required
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}