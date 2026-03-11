import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import moment from 'moment';
import DataTable from 'react-data-table-component';

const Admin = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [brideSideCount, setBrideSideCount] = useState(0);
    const [groomSideCount, setGroomSideCount] = useState(0);
    const [totalAttendance, setTotalAttendance] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('데이터 불러오기 실패:', error);
                return;
            }

            const formattedData = data.map(item => ({
                id: item.id,
                gender: item.gender === 'groom' ? '신랑측' : '신부측',
                attendanceStatus: item.attendance === 'attendance1' ? '참석' : '불참',
                mealStatus: item.meal === 'meal1' ? 'O' : 'X',
                timestampAll: moment(item.timestamp).format('YYYY-MM-DD A hh:mm:ss'),
                timestamp: moment(item.timestamp).format('YYYY-MM-DD') + '<br/>' + moment(item.timestamp).format('A hh:mm:ss'),
                name: item.name,
                phone: `${item.phone1}-${item.phone2}-${item.phone3}`,
                party: parseInt(item.party, 10) || 0,
                textarea: item.textarea || ''
            }));

            setAttendanceData(formattedData);

            const brideCount = formattedData
                .filter(item => item.gender === '신부측' && item.attendanceStatus === '참석')
                .reduce((sum, item) => sum + item.party, 0);

            const groomCount = formattedData
                .filter(item => item.gender === '신랑측' && item.attendanceStatus === '참석')
                .reduce((sum, item) => sum + item.party, 0);

            const totalCount = formattedData
                .filter(item => item.attendanceStatus === '참석')
                .reduce((sum, item) => sum + item.party, 0);

            setBrideSideCount(brideCount);
            setGroomSideCount(groomCount);
            setTotalAttendance(totalCount);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const lowerCaseFilter = filterText.toLowerCase();
        const filtered = attendanceData.filter(item =>
            item.name.toLowerCase().includes(lowerCaseFilter) ||
            item.phone.toLowerCase().includes(lowerCaseFilter) ||
            item.gender.toLowerCase().includes(lowerCaseFilter) ||
            item.attendanceStatus.toLowerCase().includes(lowerCaseFilter) ||
            item.mealStatus.toLowerCase().includes(lowerCaseFilter) ||
            item.party.toString().includes(lowerCaseFilter) ||
            item.textarea.toLowerCase().includes(lowerCaseFilter) ||
            item.timestampAll.toLowerCase().includes(lowerCaseFilter)
        );
        setFilteredData(filtered);
    }, [filterText, attendanceData]);

    const columns = [
        { name: '구분', selector: row => row.gender, sortable: true, center: true, width: '10%', wrap: true },
        { name: '이름', selector: row => row.name, center: true, width: '10%', wrap: true },
        { name: '휴대폰', selector: row => row.phone, center: true, width: '15%', wrap: true },
        { name: '참석여부', selector: row => row.attendanceStatus, sortable: true, center: true, width: '10%', wrap: true },
        { name: '식사여부', selector: row => row.mealStatus, sortable: true, center: true, width: '10%', wrap: true },
        { name: '인원', selector: row => row.party, sortable: true, center: true, width: '10%', wrap: true },
        { name: '전하는 말', selector: row => row.textarea, width: '20%', wrap: true },
        { name: '등록 시간', selector: row => <span dangerouslySetInnerHTML={{ __html: row.timestamp }} />, center: true, width: '10%' },
        { name: '등록 시간', selector: row => row.timestampAll, width: '0' },
    ];

    const SubHeaderComponent = () => (
        <div className="form-search">
            <input
                type="text"
                placeholder="Search"
                className="form-input"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                style={{ maxWidth: '300px' }}
            />
        </div>
    );

    const conditionalRowStyles = [
        { when: row => row.gender === '신랑측', style: { backgroundColor: 'rgba(104, 155, 246, .1)' } },
        { when: row => row.gender === '신부측', style: { backgroundColor: 'rgba(246, 104, 103, .1)' } },
    ];

    return (
        <div className="admin-wrap">
            <DataTable
                columns={columns}
                data={filteredData}
                noDataComponent="데이터가 없습니다!"
                customStyles={{
                    headCells: { style: { fontSize: '14px', fontWeight: 'bold', padding: '10px', justifyContent: 'center' } },
                    cells: { style: { fontSize: '14px', fontWeight: 'bold', lineHeight: '16px', padding: '5px' } },
                }}
                conditionalRowStyles={conditionalRowStyles}
                responsive
                pagination
                subHeader
                subHeaderComponent={SubHeaderComponent()}
                defaultSortFieldId={9}
                defaultSortAsc={false}
            />
            <div className="statistics">
                <p>신부측 총 인원: {brideSideCount}명</p>
                <p>신랑측 총 인원: {groomSideCount}명</p>
                <p>총 참석 인원: {totalAttendance}명</p>
            </div>
        </div>
    );
};

export default Admin;