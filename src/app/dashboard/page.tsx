'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Row, Col, Card, Modal } from 'react-bootstrap';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { fetchComments, deleteComment } from '@/lib/api';
import { Comment } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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

  useEffect(() => {
    if (isAuthenticated) {
      const getComments = async () => {
        try {
          // Get API comments
          const apiData = await fetchComments();
          
          // Get any locally stored comments
          const localComments = JSON.parse(localStorage.getItem('comments') || '[]');
          
          // Get deleted comment IDs
          const deletedIds = JSON.parse(localStorage.getItem('deletedCommentIds') || '[]');
          
          // Filter out deleted comments from API data
          const filteredApiData = apiData.filter(comment => !deletedIds.includes(comment.id));
          
          // Combine API data with local comments
          const combinedData = [...filteredApiData, ...localComments];
          
          setComments(combinedData);
          setFilteredComments(combinedData);
        } catch (error) {
          console.error('Error fetching comments:', error);
        } finally {
          setLoading(false);
        }
      };
      
      getComments();
    }
  }, [isAuthenticated]);

  // Filter comments based on body text only
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredComments(comments);
    } else {
      const filtered = comments.filter(comment => 
        comment.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredComments(filtered);
    }
  }, [searchTerm, comments]);

  // Show confirmation modal before deleting
  const confirmDelete = (id: number) => {
    setCommentToDelete(id);
    setShowDeleteModal(true);
  };

  // Handle actual deletion after confirmation
  const handleDeleteComment = async () => {
    if (commentToDelete === null) return;
    
    try {
      const id = commentToDelete;
      
      // Call API (though this is a mock delete in JSONPlaceholder)
      await deleteComment(id);
      
      // Get existing deleted IDs or initialize empty array
      const deletedIds = JSON.parse(localStorage.getItem('deletedCommentIds') || '[]');
      
      // Add this ID to the deleted list
      if (!deletedIds.includes(id)) {
        const updatedDeletedIds = [...deletedIds, id];
        localStorage.setItem('deletedCommentIds', JSON.stringify(updatedDeletedIds));
      }
      
      // Also remove from local created comments if it exists there
      const localComments = JSON.parse(localStorage.getItem('comments') || '[]') as Comment[];
      const updatedLocalComments = localComments.filter((comment: Comment) => comment.id !== id);
      localStorage.setItem('comments', JSON.stringify(updatedLocalComments));
      
      // Update state
      const updatedComments = comments.filter(comment => comment.id !== id);
      setComments(updatedComments);
      setFilteredComments(updatedComments.filter(comment => 
        comment.body.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
      // Close modal and reset commentToDelete
      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  // Function to truncate text for display
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // Custom templates for each column to handle mobile responsiveness
  const nameTemplate = (rowData: Comment) => {
    return truncateText(rowData.name, 25);
  };

  const emailTemplate = (rowData: Comment) => {
    return truncateText(rowData.email, 25);
  };

  const bodyTemplate = (rowData: Comment) => {
    return truncateText(rowData.body, 60);
  };

  const actionBodyTemplate = (rowData: Comment) => {
    return (
      <Button 
        variant="danger" 
        size="sm" 
        onClick={() => confirmDelete(rowData.id)}
        className="px-2 py-1"
      >
        Delete
      </Button>
    );
  };

  const header = (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-2">
      <span className="p-input-icon-left flex-grow-1">
        <i className="pi pi-search" />
        <InputText 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search in comments..." 
          className="w-100"
        />
      </span>
      <Link href="/create" passHref>
        <Button variant='primary' className="mt-2 mt-md-0">Create Comment</Button>
      </Link>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    return (
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this comment? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            No, Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteComment}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Mobile Card View Component
  const MobileCardView = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const commentsPerPage = 5;
    
    // Calculate pagination
    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
    const totalPages = Math.ceil(filteredComments.length / commentsPerPage);
    
    return (
      <div>
        <div className="mb-3">
          <div className="position-relative w-100">
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in comments..."
              className="w-100 ps-4"
              style={{ paddingLeft: '35px' }}
            />
          </div>
          <div className="mt-2 d-flex justify-content-between">
            <span className="text-muted">
              Showing {filteredComments.length ? indexOfFirstComment + 1 : 0}-
              {Math.min(indexOfLastComment, filteredComments.length)} of {filteredComments.length}
            </span>
            <Link href="/create" passHref>
              <Button variant="primary" size="sm">Create Comment</Button>
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-4">Loading comments...</div>
        ) : currentComments.length === 0 ? (
          <div className="text-center py-4">No comments found.</div>
        ) : (
          <>
            {currentComments.map((comment) => (
              <Card key={comment.id} className="mb-3 shadow-sm">
                <Card.Header className="d-flex justify-content-between bg-light py-2">
                  <small>ID: {comment.id}</small>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => confirmDelete(comment.id)}
                    className="py-0 px-2"
                  >
                    Delete
                  </Button>
                </Card.Header>
                <Card.Body className="p-3">
                  <div className="mb-2">
                    <strong>Name:</strong> {truncateText(comment.name, 20)}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {truncateText(comment.email, 20)}
                  </div>
                  <div>
                    <strong>Comment:</strong> {truncateText(comment.body, 100)}
                  </div>
                </Card.Body>
              </Card>
            ))}
            
            {/* Simple Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button 
                variant="outline-primary" 
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button 
                variant="outline-primary" 
                size="sm"
                disabled={indexOfLastComment >= filteredComments.length}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className={`mb-0 ${isMobile ? 'fs-4' : ''}`}>Frontend Development Test</h1>
            <Button 
              variant="outline-danger" 
              size={isMobile ? "sm" : undefined}
              onClick={() => {
                localStorage.removeItem('isLoggedIn');
                router.push('/');
              }}
            >
              Logout
            </Button>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col>
          {isMobile ? (
            <MobileCardView />
          ) : (
            <div className="card">
              <DataTable 
                value={filteredComments} 
                paginator 
                rows={10} 
                rowsPerPageOptions={[5, 10, 25, 50]} 
                tableStyle={{ minWidth: '50rem' }}
                loading={loading}
                header={header}
                emptyMessage="No comments found."
                stripedRows
              >
                <Column field="id" header="ID" sortable style={{ width: '5%' }} />
                <Column field="name" header="Name" body={nameTemplate} sortable style={{ width: '20%' }} />
                <Column field="email" header="Email" body={emailTemplate} sortable style={{ width: '20%' }} />
                <Column field="body" header="Comment" body={bodyTemplate} sortable style={{ width: '45%' }} />
                <Column body={actionBodyTemplate} header="Actions" style={{ width: '10%' }} />
              </DataTable>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal />
        </Col>
      </Row>
    </Container>
  );
}