import './all.css';
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import { Modal, Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const API_BASE_URL = "http://127.0.0.1";

function App() {
    const [events, setEvents] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        state: "Pending" // 기본 상태를 Pending으로 설정
    });
    const [calendarDate, setCalendarDate] = useState(new Date()); // 현재 날짜로 초기화

    const fetchTodos = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/todos`);
            const todos = response.data.todos.map(todo => {
                let color;
                let icon;
                switch (todo.state) {
                    case 'Pending':
                        color = '#2c3e50';
                        icon = '⚪'; // 아이콘 (예: hourglass)
                        break;
                    case 'In Progress':
                        color = '#2c3e50';
                        icon = '🔵'; // 아이콘 (예: arrows)
                        break;
                    case 'Completed':
                        color = '#2c3e50';
                        icon = '🟢'; // 아이콘 (예: check mark)
                        break;
                    case 'Cancelled':
                        color = '#2c3e50';
                        icon = '🔴'; // 아이콘 (예: cross mark)
                        break;
                    default:
                        color = '#2c3e50';
                        icon = '⚪'; // 기본 아이콘
                }
                return {
                    id: todo.index.toString(),
                    title: `${icon} ${todo.title}`, // 아이콘과 제목 결합
                    start: todo.dueDate,
                    description: todo.description,
                    status: todo.state,
                    color: color,
                };
            });
            setEvents(todos);
        } catch (error) {
            if (error.response) {
                // 200이 아닌 값으로 응답 시
                if (error.response.data && error.response.data.message) {
                    alert(error.response.data.message); // 메시지를 알림으로 표시
                } else {
                    alert("알 수 없는 오류가 발생했습니다."); // 기본 오류 메시지
                }

                // 특정 상태 코드에 따른 처리
                if (error.response.status === 500) {
                    console.error("서버 오류 발생, 모든 일정 제거:", error);
                    setEvents([]);
                } else {
                    console.error("Error fetching todos:", error);
                }
            } else {
                console.error("Error fetching todos:", error);
            }
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const handleOpenModal = (event = null) => {
        if (event) {
            setFormData({
                title: event.title.replace(/.*? /, ''), // 아이콘 제거
                description: event.description,
                dueDate: event.start,
                state: event.status // 상태 추가
            });
            setSelectedEvent(event);
        } else {
            setFormData({
                title: "",
                description: "",
                dueDate: "",
                state: "Pending" // 기본 상태 설정
            });
            setSelectedEvent(null);
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({ title: "", description: "", dueDate: "", state: "Pending" });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStateChange = (e) => {
        setFormData({ ...formData, state: e.target.value });
    };

    const addTodo = async () => {
        try {
            await axios.post(`${API_BASE_URL}/todo`, {
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate,
            });
            fetchTodos();
            handleCloseModal();
        } catch (error) {
            if (error.response) {
                if (error.response.data && error.response.data.message) {
                    alert(error.response.data.message); // 메시지를 알림으로 표시
                } else {
                    alert("알 수 없는 오류가 발생했습니다."); // 기본 오류 메시지
                }
                console.error("Error adding todo:", error);
            }
        }
    };

    const updateTodo = async () => {
        try {
            await axios.patch(`${API_BASE_URL}/todo`, {
                index: parseInt(selectedEvent.id, 10),
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate,
                state: formData.state, // 상태 추가 (수정 시)
            });
            fetchTodos();
            handleCloseModal();
        } catch (error) {
            if (error.response) {
                if (error.response.data && error.response.data.message) {
                    alert(error.response.data.message); // 메시지를 알림으로 표시
                } else {
                    alert("알 수 없는 오류가 발생했습니다."); // 기본 오류 메시지
                }
                console.error("Error updating todo:", error);
            }
        }
    };

    const deleteTodo = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/todo`, {
                data: { index: parseInt(selectedEvent.id, 10) },
            });
            fetchTodos();
            handleCloseModal();
        } catch (error) {
            if (error.response) {
                if (error.response.data && error.response.data.message) {
                    alert(error.response.data.message); // 메시지를 알림으로 표시
                } else {
                    alert("알 수 없는 오류가 발생했습니다."); // 기본 오류 메시지
                }
                console.error("Error deleting todo:", error);
            }
        }
    };

    const handleEventClick = (clickInfo) => {
        const event = events.find(e => e.id === clickInfo.event.id);
        handleOpenModal(event);
    };

    const handleDateChange = (event) => {
        const newDate = new Date(event.target.value);
        setCalendarDate(newDate);
        const year = newDate.getFullYear();
        const month = newDate.getMonth();
        calendarRef.current.getApi().gotoDate(year + '-' + (month + 1) + '-01');
    };

    const calendarRef = React.useRef(null); // ref 추가

    return (
        <div className="App">
            <div className="fullcalendar-container">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    eventClick={handleEventClick}
                    aspectRatio={2.0}
                    locale="ko"
                    headerToolbar={{
                        left: 'title',
                        right: 'dayGridMonth,dayGridWeek,dayGridDay today prev,next addTodoButton',
                    }}
                    customButtons={{
                        addTodoButton: {
                            text: 'Todo 추가', // 버튼 텍스트 설정
                            click: () => handleOpenModal() // 클릭 시 모달 열기
                        }
                    }}
                    buttonText={{
                        today: "오늘",
                        month: "월",
                        week: "주",
                        day: "일",
                        list: "리스트"
                    }}
                />
            </div>

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{ ...modalStyle }}>
                    <Typography variant="h6">{selectedEvent ? "Todo 수정" : "Todo 추가"}</Typography>
                    <TextField
                        label="제목"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="내용"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        multiline // 멀티라인으로 설정
                        rows={4} // 기본 행 수 설정
                    />
                    <TextField
                        label="예정일"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    {selectedEvent && ( // 수정 모달에서만 상태 선택 가능
                        <FormControl fullWidth margin="normal">
                            <InputLabel>상태</InputLabel>
                            <Select
                                label="상태"
                                name="state"
                                value={formData.state}
                                onChange={handleStateChange}
                            >
                                <MenuItem value="Pending">⚪ 계획</MenuItem>
                                <MenuItem value="In Progress">🔵 진행</MenuItem>
                                <MenuItem value="Completed">🟢 완료</MenuItem>
                                <MenuItem value="Cancelled">🔴 취소</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={selectedEvent ? updateTodo : addTodo}
                        sx={{ backgroundColor: '#2c3e50', color: '#fff', mt: 2, width: '100%', textTransform: 'none' }}
                    >
                        {selectedEvent ? "저장" : "추가"}
                    </Button>
                    {selectedEvent && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={deleteTodo}
                            sx={{ backgroundColor: '#2c3e50A6', color: '#fff', mt: 2, width: '100%', textTransform: 'none' }}
                        >
                            삭제
                        </Button>
                    )}
                </Box>
            </Modal>
        </div>
    );
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default App;
